import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = ({ onFinish }) => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);

  // --- ЗАХИСТ ВІД КРАШУ (Safety Check) ---
  // Якщо words.json не підтягнувся, використовуємо резервний масив.
  // Це гарантує, що кнопка "Почати" з'явиться завжди.
  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Спокій", "Тиша", "Сон", "Ніч", "Дихання", "Розслаблення", "Темрява", "Зірки"];

  // --- ЗАВАНТАЖЕННЯ ГОЛОСІВ (Android Fix) ---
  useEffect(() => {
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    
    // Android/Chrome потребують підписки на подію
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Хак для деяких Android: примусова спроба через 100мс
    const timeout = setTimeout(loadVoices, 500);

    return () => {
      synth.onvoiceschanged = null;
      clearTimeout(timeout);
    };
  }, []);

  // --- ФУНКЦІЯ ОЗВУЧКИ ---
  const speakNow = (text) => {
    // Скасовуємо попередні фрази, щоб не було черги
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Трохи повільніше
    utterance.pitch = 1;
    utterance.volume = 1;

    // Шукаємо український голос, якщо немає - беремо перший доступний
    const ukVoice = voices.find(v => v.lang.includes('uk')) || voices[0];
    if (ukVoice) utterance.voice = ukVoice;

    window.speechSynthesis.speak(utterance);
  };

  // --- ОБРОБНИК КЛІКУ (Start/Stop) ---
  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      return;
    }

    // Захист: якщо слів все ще немає, виходимо
    if (!words || words.length === 0) return;

    // 1. Обираємо перше слово
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);
    setIsPlaying(true);

    // 2. iOS/Android FIX: Запускаємо звук синхронно з кліком
    // Спочатку пустий звук для активації динаміка
    const silent = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(silent);

    // Потім реальне слово
    speakNow(firstWord);
  };

  // --- ТАЙМЕР ---
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        speakNow(nextWord);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, voices, words]);

  // --- ОЧИСТКА ПРИ ВИХОДІ ---
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

      {/* Підказка */}
      <p className="mt-8 text-[9px] text-white/20 max-w-[200px] mx-auto leading-relaxed">
        *Якщо немає звуку: перевірте гучність медіа та вимкніть беззвучний режим (iPhone).
      </p>
    </div>
  );
};