import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RevenueCard from '../components/RevenueCard';
import AnalyticsChart from '../components/AnalyticsChart';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    revenueToday: 0,
    totalOrders: 0,
    completedOrders: 0
  });
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    preparing: 0,
    delivering: 0,
    completed: 0
  });
  const [chartData, setChartData] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Single source of truth: backend aggregation
      const overviewResp = await api.get('/orders/analytics/overview?days=7');
      const overview = overviewResp.data;

      setRevenueData({
        totalRevenue: overview.kpis?.totalRevenue || 0,
        revenueToday: overview.kpis?.revenueToday || 0,
        totalOrders: overview.kpis?.totalOrders || 0,
        completedOrders: overview.kpis?.completedOrders || 0
      });

      setOrderStats({
        pending: overview.statusCounts?.pending || 0,
        preparing: overview.statusCounts?.preparing || 0,
        delivering: overview.statusCounts?.delivering || 0,
        completed: overview.statusCounts?.completed || 0
      });

      setChartData((overview.lastNDays || []).map((d) => ({ date: d.date, value: d.revenue })));

      // Calculate best-selling items
      const ordersResponse = await api.get('/orders');
      const allOrders = ordersResponse.data || [];
      const completedOrders = allOrders.filter(o => o.status === 'completed');
      const itemCounts = {};
      completedOrders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const itemName = item.name;
            if (!itemCounts[itemName]) {
              itemCounts[itemName] = { name: itemName, count: 0, revenue: 0 };
            }
            itemCounts[itemName].count += item.quantity;
            itemCounts[itemName].revenue += item.price * item.quantity;
          });
        }
      });

      const bestSellingArray = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setBestSelling(bestSellingArray);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // No fake numbers: show empty states instead
      setRevenueData({ totalRevenue: 0, revenueToday: 0, totalOrders: 0, completedOrders: 0 });
      setOrderStats({ pending: 0, preparing: 0, delivering: 0, completed: 0 });
      setChartData([]);
      setBestSelling([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
      </div>

      {/* Revenue Summary */}
      <div className="revenue-kpi-grid">
        <RevenueCard
          icon="💰"
          value={`NT$${revenueData.totalRevenue.toLocaleString()}`}
          label="Total Revenue"
        />
        <RevenueCard
          icon="📊"
          value={`NT$${revenueData.revenueToday.toLocaleString()}`}
          label="Revenue Today"
        />
        <RevenueCard
          icon="📦"
          value={revenueData.totalOrders}
          label="Total Orders"
        />
        <RevenueCard
          icon="✅"
          value={revenueData.completedOrders}
          label="Completed Orders"
        />
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <div className="section-card">
          <h3>Revenue Analytics (Last 7 Days)</h3>
          <AnalyticsChart data={chartData} type="bar" />
        </div>
      </div>

      {/* Order Analytics */}
      <div className="order-analytics-section">
        <div className="section-card">
          <h3>Order Status Summary</h3>
          <div className="order-stats-grid">
            <div className="order-stat-item">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.pending}</div>
                <div className="stat-label">Pending Orders</div>
              </div>
              <OrderStatusBadge status="pending" />
            </div>
            <div className="order-stat-item">
              <div className="stat-icon">🍳</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.preparing}</div>
                <div className="stat-label">Preparing Orders</div>
              </div>
              <OrderStatusBadge status="preparing" />
            </div>
            <div className="order-stat-item">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.delivering}</div>
                <div className="stat-label">Delivering Orders</div>
              </div>
              <OrderStatusBadge status="delivering" />
            </div>
            <div className="order-stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.completed}</div>
                <div className="stat-label">Completed Orders</div>
              </div>
              <OrderStatusBadge status="completed" />
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Items */}
      <div className="best-selling-section">
        <div className="section-card">
          <h3>Best-Selling Items</h3>
          {bestSelling.length === 0 ? (
            <div className="empty-state">
              <p>No sales data available</p>
            </div>
          ) : (
            <div className="best-selling-table">
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Times Ordered</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSelling.map((item, index) => (
                    <tr key={index}>
                      <td className="item-name-cell">{item.name}</td>
                      <td className="item-count-cell">{item.count}</td>
                      <td className="item-revenue-cell">NT$ {item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

