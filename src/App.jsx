import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TelegramBackButton } from './components/TelegramBackButton';

// Імпорт сторінок
import HomePage from './pages/HomePage';
import BreathPage from './pages/BreathPage';
import SleepPage from './pages/SleepPage';

function App() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#050505');
      tg.setBackgroundColor('#050505');
    }
  }, []);

  return (
    <BrowserRouter>
      {/* Кнопка "Назад" живе тут і слухає зміни URL */}
      <TelegramBackButton />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/breath" element={<BreathPage />} />
        <Route path="/sleep" element={<SleepPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;