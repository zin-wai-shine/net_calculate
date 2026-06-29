import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const CalculatorCard = ({
  thaiPrice,
  setThaiPrice,
  exchangeRate,
  profitAmount,
  cargoCost
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

  const isPriceInvalid = thaiPrice !== '' && parseFloat(thaiPrice) < 0;

  return (
    <div className="card">
      <h2 className="form-section-title">
        <span>Price Calculator</span>
      </h2>

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

      <div className="result-card">
        <div className="result-label">Selling Price</div>
        <div className="result-value-container">
          <span className={`result-value ${animate ? 'calc-pulse' : ''}`}>
            {formatMMK(finalPrice)}
          </span>
          <span className="result-currency">MMK</span>
        </div>
      </div>

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
