import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import KPICard from '../components/KPICard';
import OrdersChart from '../components/OrdersChart';
import StatusToggle from '../components/StatusToggle';
import './DashboardHome.css';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuStats, setMenuStats] = useState({
    total: 0,
    available: 0,
    soldOut: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const overviewResp = await api.get('/orders/analytics/overview?days=7');
      const overview = overviewResp.data;

      setChartData((overview.lastNDays || []).map((d) => ({ date: d.date, orders: d.orders })));

      setKpis({
        totalRevenue: overview.kpis?.totalRevenue || 0,
        totalOrders: overview.kpis?.totalOrders || 0,
        pendingOrders: overview.kpis?.pendingOrders || 0,
        cancelledOrders: overview.kpis?.cancelledOrders || 0
      });

      // Fetch foods
      const foodsResponse = await api.get('/foods');
      const allFoods = foodsResponse.data || [];

      // Get recent 5 orders
      const ordersResponse = await api.get('/orders');
      const allOrders = ordersResponse.data || [];
      const recent = allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          _id: order._id,
          orderId: `#${order._id.toString().slice(-6).toUpperCase()}`,
          customer: order.user?.name || 'Unknown',
          totalPrice: order.totalPrice || 0,
          status: order.status || 'pending',
          time: new Date(order.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }));
      
      setRecentOrders(recent);

      const total = allFoods.length;
      const available = allFoods.filter(f => f.available !== false).length;
      const soldOut = total - available;

      setMenuStats({ total, available, soldOut });

      const newAlerts = [];
      const oldPendingOrders = allOrders.filter(order => {
        if (order.status !== 'pending') return false;
        const orderTime = new Date(order.createdAt);
        const minutesAgo = (new Date() - orderTime) / 1000 / 60;
        return minutesAgo > 15;
      });
      
      if (oldPendingOrders.length > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${oldPendingOrders.length} orders pending over 15 minutes`
        });
      }

      if (soldOut > 0) {
        newAlerts.push({
          type: 'info',
          message: `${soldOut} menu items sold out`
        });
      }

      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setKpis({ todayRevenue: 0, ordersToday: 0, pendingOrders: 0, cancelledOrders: 0 });
      setRecentOrders([]);
      setMenuStats({ total: 0, available: 0, soldOut: 0 });
      setAlerts([{
        type: 'warning',
        message: `Failed to load dashboard data${error?.response?.status ? ` (HTTP ${error.response.status})` : ''}`
      }]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setRecentOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));

      // Refresh KPIs
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Dashboard Home</h1>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          value={`NT$${kpis.totalRevenue.toLocaleString()}`}
          label="Total Revenue"
        />
        <KPICard
          value={kpis.totalOrders}
          label="Total Orders"
        />
        <KPICard
          value={kpis.pendingOrders}
          label="Pending Orders"
          variant="warning"
        />
        <KPICard
          value={kpis.cancelledOrders}
          label="Cancelled Orders"
          variant="danger"
        />
      </div>

      {/* Charts and Recent Orders Row */}
      <div className="dashboard-main-row">
        {/* Orders Trend Chart */}
        <div className="chart-section">
          <OrdersChart data={chartData} />
        </div>

        {/* Menu Quick Stats */}
        <div className="menu-stats-section">
          <div className="section-card">
            <h3>Menu Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{menuStats.total}</div>
                <div className="stat-label">Total Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-value stat-available">{menuStats.available}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-item">
                <div className="stat-value stat-soldout">{menuStats.soldOut}</div>
                <div className="stat-label">Sold Out</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="section-card orders-section">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin-dashboard/orders')}
          >
            View All Orders
          </button>
        </div>
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderId}</td>
                    <td>{order.customer}</td>
                    <td className="price-cell">NT$ {order.totalPrice.toFixed(2)}</td>
                    <td>
                      <StatusToggle
                        status={order.status}
                        orderId={order._id}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                    <td>{order.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts & Quick Actions */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <div className="section-card">
            <h3>⚠️ Alerts & Quick Actions</h3>
            <div className="alerts-list">
              {alerts.map((alert, index) => (
                <div key={index} className={`alert alert-${alert.type}`}>
                  {alert.message}
                </div>
              ))}
            </div>
            <div className="quick-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin-dashboard/orders')}
              >
                Go to Orders
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin-dashboard/menu-management')}
              >
                Add New Menu Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

