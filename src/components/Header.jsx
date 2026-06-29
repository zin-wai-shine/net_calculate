import React from 'react';
import { Settings } from 'lucide-react';

const Header = ({ onOpenSettings }) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <h1 className="brand-title">
          <span>Net Calculate</span>
        </h1>
        <p className="brand-subtitle">Thai Baht (THB) to Myanmar Kyat (MMK) selling price calculator</p>
      </div>
      <div className="actions-section">
        <button
          className="btn btn-glass"
          onClick={onOpenSettings}
          title="Configure Calculator Settings"
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
