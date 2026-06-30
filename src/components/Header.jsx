import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';

const Header = ({ theme, onChangeTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (selectedTheme) => {
    onChangeTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <h1 className="brand-title">
          <span>Net Calculate</span>
        </h1>
        <p className="brand-subtitle">Myanmar Kyat (MMK) to Thai Baht (THB) selling price calculator</p>
      </div>

      <div className="theme-selector-container" ref={dropdownRef}>
        <button
          className="btn btn-glass btn-icon-only"
          onClick={() => setIsOpen(!isOpen)}
          title="Change Color Theme"
          aria-label="Change Color Theme"
          style={{ width: '36px', height: '36px', padding: 0 }}
        >
          <Settings size={16} />
        </button>

        {isOpen && (
          <div className="theme-dropdown-menu">
            <button
              className={`theme-dropdown-item ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('light')}
            >
              Light
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('dark')}
            >
              Dark
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'soft-blue' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('soft-blue')}
            >
              Soft Blue
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'polka-dot' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('polka-dot')}
            >
              Polka Purple
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'polka-light' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('polka-light')}
            >
              Polka Light
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'polka-dark' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('polka-dark')}
            >
              Polka Dark
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'polka-pink' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('polka-pink')}
            >
              Polka Pink
            </button>
            <button
              className={`theme-dropdown-item ${theme === 'soft-pink' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('soft-pink')}
            >
              Soft Pink
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
