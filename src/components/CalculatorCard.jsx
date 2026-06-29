import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { AlertCircle } from 'lucide-react';

const PRESET_VALUES = [
  { value: 10000, label: '10,000 MMK' },
  { value: 15000, label: '15,000 MMK' },
  { value: 20000, label: '20,000 MMK' },
  { value: 25000, label: '25,000 MMK' },
  { value: 30000, label: '30,000 MMK' },
  { value: 40000, label: '40,000 MMK' },
  { value: 50000, label: '50,000 MMK' },
  { value: 60000, label: '60,000 MMK' },
  { value: 70000, label: '70,000 MMK' },
  { value: 80000, label: '80,000 MMK' },
  { value: 90000, label: '90,000 MMK' },
  { value: 100000, label: '100,000 MMK' }
];

const CalculatorCard = ({
  thaiPrice,
  setThaiPrice,
  exchangeRate,
  setExchangeRate,
  profitAmount,
  setProfitAmount,
  cargoCost,
  setCargoCost
}) => {
  const [animate, setAnimate] = useState(false);

  const parsedThaiPrice = thaiPrice === '' ? 0 : parseFloat(thaiPrice);
  const parsedRate = exchangeRate === '' ? 0 : parseFloat(exchangeRate);
  
  // Final selling price calculation
  const baseCostMMK = parsedThaiPrice * parsedRate;
  const finalPrice = baseCostMMK + profitAmount + cargoCost;

  // Trigger pop-in animation on output change
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 200);
    return () => clearTimeout(timer);
  }, [thaiPrice, exchangeRate, profitAmount, cargoCost]);

  const formatMMK = (num) => {
    // Round to whole numbers for MMK as Kyat is usually formatted as an integer
    return Math.round(num).toLocaleString('en-US');
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setThaiPrice('');
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setThaiPrice(numValue >= 0 ? numValue : 0);
    }
  };

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setExchangeRate('');
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setExchangeRate(numValue >= 0 ? numValue : 0);
    }
  };

  const isPriceInvalid = thaiPrice !== '' && parseFloat(thaiPrice) < 0;
  const isRateInvalid = exchangeRate !== '' && parseFloat(exchangeRate) <= 0;

  // Find corresponding objects for Select display values
  const currentProfitOption = PRESET_VALUES.find(opt => opt.value === profitAmount) || PRESET_VALUES[0];
  const currentCargoOption = PRESET_VALUES.find(opt => opt.value === cargoCost) || PRESET_VALUES[0];

  // Custom styling for React-Select aligning with the glassmorphism layout
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--input-bg)',
      borderColor: state.isFocused ? 'var(--input-focus-border)' : 'var(--input-border)',
      boxShadow: state.isFocused ? 'var(--input-focus-shadow)' : 'none',
      borderRadius: '8px',
      fontFamily: 'inherit',
      fontSize: '0.9rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
      padding: '0.1rem 0.2rem',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer',
      minHeight: '38px',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--input-focus-border)' : 'var(--input-border)',
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--dropdown-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: '8px',
      boxShadow: 'var(--card-shadow)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      zIndex: 1050
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--accent-color)' 
        : state.isFocused 
          ? 'var(--formula-badge-bg)'
          : 'transparent',
      color: state.isSelected 
        ? 'var(--btn-primary-text)' 
        : 'var(--text-primary)',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: state.isSelected ? '600' : '500',
      fontFamily: 'inherit',
      padding: '0.65rem 1rem',
      '&:active': {
        backgroundColor: 'var(--text-primary)',
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-primary)',
      fontWeight: '500'
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--text-primary)'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--text-muted)'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--text-secondary)',
      '&:hover': {
        color: 'var(--text-primary)'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  return (
    <div className="card">
      <h2 className="form-section-title">
        <span>Price Calculator</span>
      </h2>

      {/* Exchange Rate */}
      <div className="form-group">
        <label className="form-label" htmlFor="exchange-rate-input">
          <span>Exchange Rate (1 THB → MMK)</span>
          {isRateInvalid && (
            <span className="validation-error">
              <AlertCircle size={12} /> Rate must be &gt; 0
            </span>
          )}
        </label>
        <div className="input-container">
          <input
            id="exchange-rate-input"
            type="number"
            className="form-input"
            value={exchangeRate}
            onChange={handleExchangeRateChange}
            placeholder="e.g., 135"
            min="0.01"
            step="any"
            required
          />
        </div>
      </div>

      {/* Profit & Cargo Row */}
      <div className="settings-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="profit-select">
            <span>Profit Margin (MMK)</span>
          </label>
          <div className="input-container" style={{ display: 'block' }}>
            <Select
              id="profit-select"
              options={PRESET_VALUES}
              value={currentProfitOption}
              onChange={(option) => setProfitAmount(option.value)}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="cargo-select">
            <span>Cargo Cost (MMK)</span>
          </label>
          <div className="input-container" style={{ display: 'block' }}>
            <Select
              id="cargo-select"
              options={PRESET_VALUES}
              value={currentCargoOption}
              onChange={(option) => setCargoCost(option.value)}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Thai Product Price */}
      <div className="form-group">
        <label className="form-label" htmlFor="thai-price-input">
          <span>Thai Product Price (THB)</span>
          {isPriceInvalid && (
            <span className="validation-error">
              <AlertCircle size={12} /> Price cannot be negative
            </span>
          )}
        </label>
        <div className="input-container">
          <div className="input-icon">
            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)' }}>฿</span>
          </div>
          <input
            id="thai-price-input"
            type="number"
            className="form-input form-input-with-icon"
            value={thaiPrice}
            onChange={handlePriceChange}
            placeholder="0"
            min="0"
            step="any"
            autoFocus
          />
        </div>
      </div>

      {/* Result Display */}
      <div className="result-card">
        <div className="result-label">Selling Price</div>
        <div className="result-value-container">
          <span className={`result-value ${animate ? 'calc-pulse' : ''}`}>
            {formatMMK(finalPrice)}
          </span>
          <span className="result-currency">MMK</span>
        </div>
      </div>

      {/* Formula Breakdown */}
      <div className="formula-section">
        <div className="formula-title">Formula Breakdown</div>
        <div className="formula-grid">
          {/* Base Conversion */}
          <div className="formula-row">
            <div className="formula-term">
              <span>Thai Price × Rate</span>
              <span className="formula-term-sub">
                {thaiPrice === '' ? '0' : thaiPrice} ฿ × {parsedRate}
              </span>
            </div>
            <div className="formula-value">{formatMMK(baseCostMMK)} MMK</div>
          </div>

          {/* Profit */}
          <div className="formula-row">
            <div className="formula-term">
              <span>Profit Margin</span>
            </div>
            <div className="formula-value">+{formatMMK(profitAmount)} MMK</div>
          </div>

          {/* Cargo */}
          <div className="formula-row">
            <div className="formula-term">
              <span>Cargo Cost</span>
            </div>
            <div className="formula-value">+{formatMMK(cargoCost)} MMK</div>
          </div>

          <div className="formula-divider"></div>

          {/* Final Price */}
          <div className="formula-row formula-row-total">
            <div className="formula-term">
              <span>Final Price</span>
            </div>
            <div className="formula-value">{formatMMK(finalPrice)} MMK</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorCard;
