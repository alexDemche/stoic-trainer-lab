import { useState } from 'react';
import { MOODS } from '@/lib/moods';
import { motion } from 'framer-motion';

export const MoodSelector = ({ onSelect }) => {
  // Додаємо стан для вибору часу (у секундах)
  const [selectedTime, setSelectedTime] = useState(300);

  const timeOptions = [
    { label: '1 хв', value: 60 },
    { label: '3 хв', value: 180 },
    { label: '5 хв', value: 300 },
    { label: '10 хв', value: 600 },
  ];

  return (
    <div className="fixed inset-0 w-full bg-[#050505] overflow-y-auto overflow-x-hidden p-5">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 mb-2 text-center"
      >
        <span className="text-white/30 text-[8px] uppercase tracking-[0.5em] font-medium border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
          Квадратнe дихання • 4-4-4-4
        </span>
      </motion.div>
      {/* Заголовок */}
      <header className="mb-8 mt-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-light text-white tracking-tight mb-2"
        >
          Обери свій <span className="font-bold italic">потік</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-sm tracking-wide"
        >
          Синхронізуй дихання та розум
        </motion.p>
      </header>

      {/* СЕЛЕКТОР ЧАСУ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto mb-10"
      >
        <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-1.5 shadow-2xl">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTime(option.value)}
              className={`
                relative flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 rounded-[18px]
                ${selectedTime === option.value ? 'text-white' : 'text-white/30 hover:text-white/50'}
              `}
            >
              {selectedTime === option.value && (
                <motion.div 
                  layoutId="activeTime"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-[18px]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Сітка карток */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto pb-10">
        {MOODS.map((mood, index) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }} // Трохи затримав появу карток після селектора
            whileTap={{ scale: 0.97 }}
            // ПЕРЕДАЄМО ОБРАНИЙ ЧАС РАЗОМ З MOOD
            onClick={() => onSelect({ ...mood, duration: selectedTime })}
            className={`
              relative h-48 rounded-[32px] p-6 flex flex-col justify-between 
              overflow-hidden border border-white/10 group transition-all
              bg-gradient-to-br ${mood.color}
            `}
          >
            {/* Ефект скляного нальоту */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] group-hover:bg-black/0 transition-colors" />

            {/* Фонова іконка для глибини */}
            <mood.icon className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />

            {/* Верхня частина картки */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                <mood.icon className="w-6 h-6 text-white shadow-sm" />
              </div>
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                {mood.affirmations?.length || 8} афірмацій
              </div>
            </div>

            {/* Нижня частина картки */}
            <div className="relative z-10 text-left">
              <p className="text-xs text-white/60 font-medium tracking-wide mb-1 italic">
                {mood.sub}
              </p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {mood.label}
              </h3>
            </div>

            {/* Ледь помітне світіння при наведенні */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)] mix-blend-overlay" />
          </motion.button>
        ))}
      </div>

      {/* СЕКЦІЯ ПРО МЕТОД */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-md mx-auto mt-12 mb-8 p-6 rounded-[24px] bg-white/5 border border-white/5 backdrop-blur-sm"
      >
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3 font-bold">
          Що таке дихання квадратом?
        </h4>
        <p className="text-xs text-white/40 leading-relaxed font-light italic">
          Це потужна техніка концентрації, яку використовують професійні атлети та психологи. 
          Ритм <span className="text-white/60 font-medium">4-4-4-4</span> (вдих 4 секунди, затримка 4 секунди, видих 4 секунди, затримка 4 секунди) миттєво заспокоює нервову систему, знижує рівень кортизолу та повертає фокус у момент "тут і зараз".
        </p>
      </motion.div>
      {/* Футер-підказка */}
      <footer className="mt-4 mb-8 text-center text-white/20 text-[10px] uppercase tracking-[0.3em]">
        Метод Квадратного дихання • 4-4-4-4
      </footer>
    </div>
  );
};