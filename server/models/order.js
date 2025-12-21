import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    name: { type: String, required: true },   // snapshot of food name
    price: { type: Number, required: true },  // snapshot of price at order time
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false } // we don't need separate _id for each item
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, "Order must have at least 1 item"],
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "preparing", "delivering", "completed", "cancelled"],
      default: "pending",
    },
    // Delivery info (persisted from checkout)
    deliveryAddress: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    recipientName: { type: String, trim: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
