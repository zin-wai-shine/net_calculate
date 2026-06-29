import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { AlertCircle, X } from 'lucide-react';

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

const SettingsCard = ({
  isOpen,
  onClose,
  theme,
  exchangeRate,
  setExchangeRate,
  profitAmount,
  setProfitAmount,
  cargoCost,
  setCargoCost
}) => {
  // Temporary states for changes within the modal
  const [tempRate, setTempRate] = useState(exchangeRate);
  const [tempProfit, setTempProfit] = useState(profitAmount);
  const [tempCargo, setTempCargo] = useState(cargoCost);

  // Sync temporary state with actual state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempRate(exchangeRate);
      setTempProfit(profitAmount);
      setTempCargo(cargoCost);
    }
  }, [isOpen, exchangeRate, profitAmount, cargoCost]);

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setTempRate('');
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setTempRate(numValue >= 0 ? numValue : 0);
    }
  };

  const isRateInvalid = tempRate !== '' && parseFloat(tempRate) <= 0;

  // React Select Custom Styling aligned with our glass liquid layout
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
      backgroundColor: theme === 'dark' ? '#222222' : '#ffffff',
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
        ? 'var(--text-primary)' 
        : state.isFocused 
          ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(34, 34, 34, 0.04)')
          : 'transparent',
      color: state.isSelected 
        ? (theme === 'dark' ? '#222222' : '#ffffff') 
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

  // Find corresponding objects for Select display values
  const currentProfitOption = PRESET_VALUES.find(opt => opt.value === tempProfit) || PRESET_VALUES[0];
  const currentCargoOption = PRESET_VALUES.find(opt => opt.value === tempCargo) || PRESET_VALUES[0];

  const handleSave = () => {
    if (tempRate === '' || parseFloat(tempRate) <= 0) {
      return; // Prevent saving if invalid exchange rate
    }
    setExchangeRate(tempRate.toString());
    setProfitAmount(tempProfit);
    setCargoCost(tempCargo);
    onClose(); // Close modal
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Calculator Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close Settings">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
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
                value={tempRate}
                onChange={handleExchangeRateChange}
                placeholder="e.g., 135"
                min="0.01"
                step="any"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profit-select">
              <span>Profit Amount (MMK)</span>
            </label>
            <div className="input-container" style={{ display: 'block' }}>
              <Select
                id="profit-select"
                options={PRESET_VALUES}
                value={currentProfitOption}
                onChange={(option) => setTempProfit(option.value)}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cargo-select">
              <span>Cargo Cost (MMK)</span>
            </label>
            <div className="input-container" style={{ display: 'block' }}>
              <Select
                id="cargo-select"
                options={PRESET_VALUES}
                value={currentCargoOption}
                onChange={(option) => setTempCargo(option.value)}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isRateInvalid || tempRate === ''}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
export { PRESET_VALUES };
