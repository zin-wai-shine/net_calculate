import React, { useState, useEffect } from 'react';
import Header from './components/Header';
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
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-soft-blue');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'soft-blue') {
      document.body.classList.add('theme-soft-blue');
    } else {
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  return (
    <div className="app-wrapper">
      <Header theme={theme} onChangeTheme={setTheme} />
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

      <footer className="footer-text">
        <span>Net_Calculate &copy; {new Date().getFullYear()} — Built for modern, high-speed business usage.</span>
      </footer>
    </div>
  );
}

export default App;
