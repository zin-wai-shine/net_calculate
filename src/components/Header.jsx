import React from 'react';
import { Moon, Sun, RotateCcw, Settings } from 'lucide-react';

const Header = ({ theme, toggleTheme, handleReset, onOpenSettings }) => {
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
        <button
          className="btn btn-glass btn-icon-only"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="btn btn-glass"
          onClick={handleReset}
          title="Reset Calculator Settings"
        >
          <RotateCcw size={14} />
          <span>Reset Settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
