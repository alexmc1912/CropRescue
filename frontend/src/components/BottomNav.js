// BottomNav.js
import React, { useState } from 'react';

const BottomNav = ({ currentPage, onChangePage }) => {
  const tabs = [
    { name: 'Profile', icon: '👤' },
    { name: 'Dashboard', icon: '📊' },
    { name: 'Discover', icon: '🔍' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.name}
          className={`bottom-nav-btn ${currentPage === tab.name ? 'active' : ''}`}
          onClick={() => onChangePage(tab.name)}
          aria-label={tab.name}
          aria-current={currentPage === tab.name ? 'page' : undefined}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
