import React from 'react';
import './OrdersChart.css';

const OrdersChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="orders-chart">
        <div className="chart-header">
          <h3>Orders Trend (Last 7 Days)</h3>
        </div>
        <div className="chart-container">
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            No trend data available.
          </div>
        </div>
      </div>
    );
  }

  const maxOrders = Math.max(...safeData.map(d => Number(d.orders) || 0), 1);
  const chartHeight = 200;

  return (
    <div className="orders-chart">
      <div className="chart-header">
        <h3>Orders Trend (Last 7 Days)</h3>
      </div>
      <div className="chart-container">
        <div className="chart-bars">
          {safeData.map((item, index) => {
            const orders = Number(item.orders) || 0;
            const height = (orders / maxOrders) * chartHeight;
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar"
                  style={{ height: `${height}px` }}
                  title={`${item.date}: ${orders} orders`}
                >
                  <span className="bar-value">{orders}</span>
                </div>
                <div className="bar-label">{item.date}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersChart;

