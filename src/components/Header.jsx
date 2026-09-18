import React, { useState, useEffect, useRef } from 'react';
import { Settings, Image, Info, Type } from 'lucide-react';

const Header = ({ theme, onChangeTheme, onOpenWatermark, onOpenTextEditor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const dropdownRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setIsInfoOpen(false);
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
        <div className="brand-title-row">
          <h1 className="brand-title">
            <span>Net Calculate</span>
          </h1>
          <div
            className={`brand-info-wrapper ${isInfoOpen ? 'active' : ''}`}
            ref={infoRef}
            onMouseEnter={() => setIsInfoOpen(true)}
            onMouseLeave={() => setIsInfoOpen(false)}
          >
            <button
              type="button"
              className="brand-info-btn"
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              title="Myanmar Kyat (MMK) to Thai Baht (THB) selling price calculator"
              aria-label="Description info"
            >
              <Info size={16} />
            </button>
            <div className="brand-info-tooltip" role="tooltip">
              Myanmar Kyat (MMK) to Thai Baht (THB) selling price calculator
            </div>
          </div>
        </div>
      </div>

      <div className="header-controls-container">
        <button
          className="btn btn-glass btn-icon-only"
          onClick={onOpenTextEditor}
          title="Bold Text Editor"
          aria-label="Bold Text Editor"
          style={{ width: '36px', height: '36px', padding: 0 }}
        >
          <Type size={16} />
        </button>

        <button
          className="btn btn-glass btn-icon-only"
          onClick={onOpenWatermark}
          title="Watermark Studio"
          aria-label="Watermark Studio"
          style={{ width: '36px', height: '36px', padding: 0 }}
        >
          <Image size={16} />
        </button>

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
      </div>
    </header>
  );
};

export default Header;
