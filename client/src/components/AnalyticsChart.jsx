import React from 'react';
import './AnalyticsChart.css';

const AnalyticsChart = ({ data, type = 'bar' }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="analytics-chart">
        <div className="chart-container">
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            No chart data available.
          </div>
        </div>
      </div>
    );
  }


//array
  const maxValue = Math.max(...safeData.map(d => Number(d.value) || 0), 1);
  const chartHeight = 200;

  if (type === 'line') {
    return (
      <div className="analytics-chart">
        <div className="chart-container-line">
          <svg viewBox={`0 0 ${data.length * 100} ${chartHeight + 40}`} className="chart-svg">
            {safeData.map((item, index) => {
              const x = index * 100 + 50;
              const value = Number(item.value) || 0;
              const y = chartHeight - (value / maxValue) * chartHeight;
              const nextX = (index + 1) * 100 + 50;
              const nextY = index < data.length - 1 
                ? chartHeight - ((Number(safeData[index + 1].value) || 0) / maxValue) * chartHeight
                : y;
              
              return (
                <g key={index}>
                  {index < data.length - 1 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={nextX}
                      y2={nextY}
                      stroke="#ff6b35"
                      strokeWidth="3"
                      className="chart-line"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#ff6b35"
                    className="chart-point"
                  />
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    className="chart-value"
                    fill="#333"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {value}
                  </text>
                  <text
                    x={x}
                    y={chartHeight + 30}
                    textAnchor="middle"
                    className="chart-label"
                    fill="#666"
                    fontSize="11"
                  >
                    {item.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div className="analytics-chart">
      <div className="chart-container">
        <div className="chart-bars">
          {safeData.map((item, index) => {
            const value = Number(item.value) || 0;
            const height = (value / maxValue) * chartHeight;
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar"
                  style={{ height: `${height}px` }}
                  title={`${item.date}: NT$ ${value.toLocaleString()}`}
                >
                  <span className="bar-value">NT$ {value.toLocaleString()}</span>
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

export default AnalyticsChart;

