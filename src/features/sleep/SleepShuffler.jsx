import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Можеш винести слова в src/data/words.json
const WORDS = ["Дерево", "Кіт", "Хмара", "Океан", "Гора", "Літак", "Книга", "Лампа"];

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text) => {
    // Перевірка підтримки браузером
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'uk-UA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      const next = () => {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setWord(randomWord);
        speak(randomWord);
      };
      next(); // Одразу перше слово
      interval = setInterval(next, 5000); // Інтервал 5 сек
    } else {
      window.speechSynthesis.cancel();
    }
    return () => clearInterval(interval);
  }, [isPlaying, speak]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-4xl font-light tracking-widest text-white mb-10"
          >
            {word}
          </motion.h1>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
            <h2 className="text-xl text-white/50 tracking-[0.2em] uppercase">Когнітивний потік</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`
          px-8 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-xs transition-all
          ${isPlaying ? 'bg-red-500/10 text-red-200' : 'bg-white/5 text-white hover:bg-white/10'}
        `}
      >
        {isPlaying ? 'Зупинити' : 'Почати сон'}
      </button>
    </div>
  );
};