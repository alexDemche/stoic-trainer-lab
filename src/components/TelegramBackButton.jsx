import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TelegramBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    const handleBackClick = () => {
      navigate(-1); // Повертаємось на попередню сторінку в історії React
    };

    tg.BackButton.onClick(handleBackClick);

    return () => {
      tg.BackButton.offClick(handleBackClick);
    };
  }, [location, navigate]);

  return null; // Компонент нічого не малює, лише логіка
};