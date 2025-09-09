import React from 'react';

const ImpactTracker = ({ items }) => {
  const total = items.reduce((acc, item) => acc + item.quantity, 0);
  const goal = 1000;
  const progressPercent = Math.min(100, (total / goal) * 100);

  return (
    <div className="impact-tracker">
      <h2>Impact Tracker</h2>
      <p>Total Food Surplus Posted: {total} units</p>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
          {Math.round(progressPercent)}%
        </div>
      </div>
    </div>
  );
};

export default ImpactTracker;
