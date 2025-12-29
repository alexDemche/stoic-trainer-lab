import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const TelegramBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) return;

    // Показуємо кнопку всюди, крім Головної ('/')
    if (location.pathname !== '/') {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }

    const handleBack = () => {
      navigate('/'); // Завжди повертаємо на головну
    };

    tg.onEvent('backButtonClicked', handleBack);

    return () => {
      tg.offEvent('backButtonClicked', handleBack);
    };
  }, [location, navigate, tg]);

  return null;
};