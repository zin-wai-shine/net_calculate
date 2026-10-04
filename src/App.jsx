import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CalculatorCard from './components/CalculatorCard';
import WatermarkStudio from './components/WatermarkStudio';
import TextEditor from './components/TextEditor';
import NextCalculatePage from './components/NextCalculatePage';
import PermissionModal from './components/PermissionModal';

function App() {
  const [currentView, setCurrentView] = useState('calculator'); // 'calculator' | 'watermark' | 'text-editor' | 'next-calculate'
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isCalculateUnlocked, setIsCalculateUnlocked] = useState(() => {
    return localStorage.getItem('net_calc_permission_unlocked') === 'true';
  });

  // Lazy state initialization from LocalStorage
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('net_calc_exchange_rate');
    return saved !== null ? saved : '135';
  });

  const [profitAmount, setProfitAmount] = useState(() => {
    const saved = localStorage.getItem('net_calc_profit_amount');
    if (saved !== null) {
      if (saved === '') return '';
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 10000 : parsed;
    }
    return 10000;
  });

  const [cargoCost, setCargoCost] = useState(() => {
    const saved = localStorage.getItem('net_calc_cargo_cost');
    if (saved !== null) {
      if (saved === '') return '';
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 10000 : parsed;
    }
    return 10000;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('net_calc_theme');
    return saved !== null ? saved : 'dark';
  });

  const [thaiPrice, setThaiPrice] = useState('');

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('net_calc_exchange_rate', exchangeRate);
  }, [exchangeRate]);

  // Sync profit margin
  useEffect(() => {
    localStorage.setItem('net_calc_profit_amount', profitAmount.toString());
  }, [profitAmount]);

  // Sync cargo cost
  useEffect(() => {
    localStorage.setItem('net_calc_cargo_cost', cargoCost.toString());
  }, [cargoCost]);

  // Sync theme selection and apply classes to body
  useEffect(() => {
    localStorage.setItem('net_calc_theme', theme);
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-soft-blue', 'theme-polka-dot', 'theme-polka-light', 'theme-polka-dark', 'theme-polka-pink', 'theme-soft-pink');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'soft-blue') {
      document.body.classList.add('theme-soft-blue');
    } else if (theme === 'polka-dot') {
      document.body.classList.add('theme-polka-dot');
    } else if (theme === 'polka-light') {
      document.body.classList.add('theme-polka-light');
    } else if (theme === 'polka-dark') {
      document.body.classList.add('theme-polka-dark');
    } else if (theme === 'polka-pink') {
      document.body.classList.add('theme-polka-pink');
    } else if (theme === 'soft-pink') {
      document.body.classList.add('theme-soft-pink');
    } else {
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  const handleOpenCalculate = () => {
    if (isCalculateUnlocked) {
      setCurrentView('next-calculate');
    } else {
      setIsPermissionModalOpen(true);
    }
  };

  const handlePermissionSuccess = () => {
    setIsCalculateUnlocked(true);
    localStorage.setItem('net_calc_permission_unlocked', 'true');
    setCurrentView('next-calculate');
  };

  return (
    <div className="app-wrapper">
      {currentView === 'calculator' ? (
        <>
          <Header
            theme={theme}
            onChangeTheme={setTheme}
            onOpenCalculate={handleOpenCalculate}
            onOpenWatermark={() => setCurrentView('watermark')}
            onOpenTextEditor={() => setCurrentView('text-editor')}
          />
          <main className="calculator-grid">
            <div className="calculator-container">
              <CalculatorCard
                thaiPrice={thaiPrice}
                setThaiPrice={setThaiPrice}
                exchangeRate={exchangeRate}
                setExchangeRate={setExchangeRate}
                profitAmount={profitAmount}
                setProfitAmount={setProfitAmount}
                cargoCost={cargoCost}
                setCargoCost={setCargoCost}
              />
            </div>
          </main>
        </>
      ) : currentView === 'watermark' ? (
        <WatermarkStudio onBack={() => setCurrentView('calculator')} />
      ) : currentView === 'text-editor' ? (
        <TextEditor onBack={() => setCurrentView('calculator')} />
      ) : (
        <NextCalculatePage onBack={() => setCurrentView('calculator')} />
      )}

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onSuccess={handlePermissionSuccess}
      />

      {currentView !== 'next-calculate' && (
        <footer className="footer-text">
          <span>Net_Calculate &copy; {new Date().getFullYear()} — Built for modern, high-speed business usage.</span>
        </footer>
      )}
    </div>
  );
}

export default App;
