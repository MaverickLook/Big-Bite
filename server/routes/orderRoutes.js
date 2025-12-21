import express from "express";
import Order from "../models/order.js";
import Food from "../models/food.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * Helper: allowed order statuses
 */
const ALLOWED_STATUS = [
  "pending",
  "preparing",
  "delivering",
  "completed",
  "cancelled",
];

/**
 * Helper: strict forward-only lifecycle
 * Pending → Preparing → Delivering → Completed
 */
const STATUS_FLOW = ["pending", "preparing", "delivering", "completed"];

const getAllowedNextStatuses = (currentStatus) => {
  if (currentStatus === "cancelled" || currentStatus === "completed") return [];
  if (currentStatus === "pending") return ["preparing", "cancelled"];
  const idx = STATUS_FLOW.indexOf(currentStatus);
  if (idx === -1) return []; // unknown/legacy status: reject to be safe
  const next = STATUS_FLOW[idx + 1];
  return next ? [next] : [];
};

/**
 * @route   GET /api/orders/analytics/overview
 * @desc    Admin analytics (single source of truth)
 * @query   days (default 7)
 * @returns kpis + statusCounts + lastNDays series
 */
router.get("/analytics/overview", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || "7", 10), 1), 30);

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: 1 })
      .lean();

    // Status counts (all-time from this window)
    const statusCounts = {
      pending: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
    };

    // Revenue metrics (completed-only, consistent and trustworthy)
    let totalRevenue = 0;
    let completedOrders = 0;

    // Prepare empty series map for last N days
    const seriesMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      seriesMap.set(key, { date: label, orders: 0, revenue: 0 });
    }

    // Get today's date key (last day in the series)
    const todayKey = end.toISOString().slice(0, 10);

    for (const o of orders) {
      const status = o.status || "pending";
      if (statusCounts[status] !== undefined) statusCounts[status] += 1;

      const created = new Date(o.createdAt);
      const dayKey = created.toISOString().slice(0, 10);

      // orders trend: count non-cancelled orders
      if (status !== "cancelled" && seriesMap.has(dayKey)) {
        seriesMap.get(dayKey).orders += 1;
      }

      // revenue trend: completed-only
      if (status === "completed") {
        const price = Number(o.totalPrice || 0);
        if (seriesMap.has(dayKey)) seriesMap.get(dayKey).revenue += price;
        totalRevenue += price;
        completedOrders += 1;
      }
    }

    const lastNDays = Array.from(seriesMap.values());

    // Calculate Revenue Today: Sum of orders COMPLETED today (not created today)
    // Since we don't have completedAt, we use updatedAt as a proxy
    // When status changes to "completed", updatedAt is updated
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayCompletedOrders = await Order.find({
      status: "completed",
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    }).lean();

    let revenueToday = 0;
    const completedOrderCountToday = todayCompletedOrders.length;

    for (const order of todayCompletedOrders) {
      const price = Number(order.totalPrice || 0);
      revenueToday += price;
    }

    // Debug logging (non-sensitive data only)
    console.log(`[Analytics] Revenue Today Calculation:`);
    console.log(`  - Completed orders today: ${completedOrderCountToday}`);
    console.log(`  - Revenue Today: NT$${revenueToday.toFixed(2)}`);
    console.log(`  - Date range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);

    // Get today's orders count from the series (last day in the window)
    const todayData = seriesMap.get(todayKey) || { orders: 0, revenue: 0 };
    const ordersToday = todayData.orders;

    return res.json({
      kpis: {
        totalRevenue,
        revenueToday,
        totalOrders: orders.length, // in window
        completedOrders,
        ordersToday,
        pendingOrders: statusCounts.pending,
        cancelledOrders: statusCounts.cancelled,
      },
      statusCounts,
      lastNDays,
      range: { start, end, days },
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Create a new order (logged-in user)
 * @body    { items: [{ foodId, quantity }] }
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, deliveryAddress, phoneNumber, recipientName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    if (!deliveryAddress || typeof deliveryAddress !== "string" || deliveryAddress.trim() === "") {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Get all foodIds and fetch from DB
    const foodIds = items.map((i) => i.foodId);
    const foods = await Food.find({ _id: { $in: foodIds }, available: true });

    if (foods.length !== items.length) {
      return res
        .status(400)
        .json({ message: "Some food items are invalid or unavailable" });
    }

    // Build items snapshot + total price
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const food = foods.find((f) => f._id.toString() === item.foodId);

      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const price = food.price * quantity;

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity,
      });

      totalPrice += price;
    }

    const order = await Order.create({
      user: req.user.id, // make sure your JWT has { id, role }
      items: orderItems,
      totalPrice,
      deliveryAddress: deliveryAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      recipientName: typeof recipientName === "string" ? recipientName.trim() : undefined,
    });

    const populated = await order.populate("user", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/**
 * @route   GET /api/orders/user/:id
 * @desc    Get all orders of a user
 *          - user can see their own orders
 *          - admin can see anyone's orders
 */
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Not allowed to view these orders" });
    }

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json(orders);
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin only)
 */
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json(orders);
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 *          - user can see their own order
 *          - admin can see any order
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission (own order or admin)
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to view this order" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @body    { status }
 */
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status", allowed: ALLOWED_STATUS });
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Completed or cancelled orders are read-only
    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({
        message: "Order is read-only (completed or cancelled)",
        currentStatus: order.status,
      });
    }

    const allowedNext = getAllowedNextStatuses(order.status);
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: "Invalid status transition",
        currentStatus: order.status,
        allowedNext,
      });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;
