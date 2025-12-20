import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoodPlayer } from '@/features/mood-player/MoodPlayer';
import { MoodSelector } from '@/features/dashboard/MoodSelector';

function App() {
  const [activeMood, setActiveMood] = useState(null);

  // --- ДОДАНИЙ БЛОК ДЛЯ TELEGRAM ---
  useEffect(() => {
    // Перевіряємо, чи ми в Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); // Ця команда змушує iPhone розгорнути додаток на 100% висоти
      
      // Блокуємо вертикальний свайп, щоб випадково не закрити (опціонально)
      // tg.enableClosingConfirmation(); 
    }
  }, []);
  // ----------------------------------

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeMood ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <MoodSelector onSelect={setActiveMood} />
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MoodPlayer 
              mood={activeMood}
              duration={activeMood.duration}
              onBack={() => setActiveMood(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;