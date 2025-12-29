import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SleepShuffler } from '../features/sleep/SleepShuffler';
import { MuscleRelaxation } from '../features/sleep/MuscleRelaxation';

const SleepPage = () => {
  const [mode, setMode] = useState(null); // 'shuffling', 'relaxation' або null

  const cardStyle = "w-full p-8 bg-white/5 border border-white/10 rounded-[32px] text-left group active:scale-95 transition-all";

  return (
    <div className="min-h-screen w-full bg-[#050505] p-6 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-md mt-20 space-y-6"
          >
            <h1 className="text-2xl text-white font-light tracking-tight mb-10 text-center">Як ти хочеш заснути?</h1>
            
            <button onClick={() => setMode('shuffling')} className={cardStyle}>
              <span className="text-2xl">🧠</span>
              <h3 className="text-white text-xl mt-4">Вимкнути думки</h3>
              <p className="text-white/30 text-xs mt-1">Когнітивне перемішування (Shuffling)</p>
            </button>

            <button onClick={() => setMode('relaxation')} className={cardStyle}>
              <span className="text-2xl">🧘</span>
              <h3 className="text-white text-xl mt-4">Розслабити тіло</h3>
              <p className="text-white/30 text-xs mt-1">Прогресивна релаксація м'язів</p>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full"
          >
            {mode === 'shuffling' ? (
              <SleepShuffler onFinish={() => setMode(null)} />
            ) : (
              <MuscleRelaxation onFinish={() => setMode(null)} />
            )}
            
            <button 
              onClick={() => setMode(null)}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 text-white/20 text-[10px] uppercase tracking-[0.4em]"
            >
              Зупинити практику
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SleepPage;