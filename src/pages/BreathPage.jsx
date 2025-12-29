import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Імпортуємо з features, як у тебе в структурі
import { MoodSelector } from '../features/dashboard/MoodSelector';
import { MoodPlayer } from '../features/mood-player/MoodPlayer';

const BreathPage = () => {
  const [activeMood, setActiveMood] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <AnimatePresence mode="wait">
        {!activeMood ? (
          <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MoodSelector onSelect={setActiveMood} />
          </motion.div>
        ) : (
          <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* onBack тепер просто скидає стейт. Якщо стейту немає - кнопка Telegram поверне на Home */}
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
};

export default BreathPage;