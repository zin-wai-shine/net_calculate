import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SettingsCard from './components/SettingsCard';
import CalculatorCard from './components/CalculatorCard';

function App() {
  // Lazy state initialization from LocalStorage
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('net_calc_exchange_rate');
    return saved !== null ? saved : '135';
  });

  const [profitAmount, setProfitAmount] = useState(() => {
    const saved = localStorage.getItem('net_calc_profit_amount');
    return saved !== null ? parseInt(saved, 10) : 10000;
  });

  const [cargoCost, setCargoCost] = useState(() => {
    const saved = localStorage.getItem('net_calc_cargo_cost');
    return saved !== null ? parseInt(saved, 10) : 10000;
  });

  const [thaiPrice, setThaiPrice] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('net_calc_exchange_rate', exchangeRate);
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem('net_calc_profit_amount', profitAmount.toString());
  }, [profitAmount]);

  useEffect(() => {
    localStorage.setItem('net_calc_cargo_cost', cargoCost.toString());
  }, [cargoCost]);

  // Enforce dark mode globally
  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  return (
    <>
      <div className="app-wrapper">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="calculator-grid">
          <div className="calculator-container">
            <CalculatorCard
              thaiPrice={thaiPrice}
              setThaiPrice={setThaiPrice}
              exchangeRate={exchangeRate}
              profitAmount={profitAmount}
              cargoCost={cargoCost}
            />
          </div>
        </main>

        <footer className="footer-text">
          <span>Net_Calculate &copy; {new Date().getFullYear()} — Built for modern, high-speed business usage.</span>
        </footer>
      </div>

      <SettingsCard
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme="dark"
        exchangeRate={exchangeRate}
        setExchangeRate={setExchangeRate}
        profitAmount={profitAmount}
        setProfitAmount={setProfitAmount}
        cargoCost={cargoCost}
        setCargoCost={setCargoCost}
      />
    </>
  );
}

export default App;
