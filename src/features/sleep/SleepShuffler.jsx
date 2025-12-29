import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wordsList from '../../data/words.json';

export const SleepShuffler = ({ onFinish }) => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Зберігаємо голоси, щоб не шукати їх щоразу
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Функція завантаження голосів (для Android/iOS це критично)
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    // Chrome/Safari завантажують голоси асинхронно
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Головна функція озвучки
  const speakNow = (text) => {
    // 1. Зупиняємо все, що говорило до цього
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    // 2. Спроба знайти український голос, інакше беремо будь-який
    const ukVoice = voices.find(v => v.lang.includes('uk')) || voices[0];
    if (ukVoice) utterance.voice = ukVoice;

    // 3. ЗАПУСК
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    if (isPlaying) {
      // ЗУПИНКА
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      return;
    }

    // СТАРТ
    // 1. Обираємо перше слово
    const firstWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    setWord(firstWord);
    setIsPlaying(true);

    // 2. КРИТИЧНО ВАЖЛИВО: Запускаємо звук ПРЯМО ТУТ, синхронно з кліком
    // Спочатку "прогріваємо" рушій порожнім звуком (хак для iOS)
    const silent = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(silent);

    // Потім говоримо слово
    speakNow(firstWord);
  };

  // Таймер для наступних слів
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        setWord(nextWord);
        speakNow(nextWord);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, voices]); // voices у залежностях важливі

  // Очистка при виході зі сторінки
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(5px)" }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-light tracking-widest text-white mb-10 mt-10"
          >
            {word}
          </motion.h1>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 mt-10">
            <h2 className="text-xl text-white/50 tracking-[0.2em] uppercase">Когнітивний потік</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`
          px-10 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-xs transition-all active:scale-95
          ${isPlaying ? 'bg-red-500/10 text-red-200 border-red-500/20' : 'bg-white/5 text-white hover:bg-white/10'}
        `}
      >
        {isPlaying ? 'Зупинити' : 'Почати занурення'}
      </button>

      {/* Підказка для iPhone */}
      <p className="mt-8 text-[9px] text-white/20 max-w-[200px] mx-auto leading-relaxed">
        *Якщо немає звуку на iPhone: вимкніть беззвучний режим (важіль збоку) або додайте гучність під час відтворення.
      </p>
    </div>
  );
};