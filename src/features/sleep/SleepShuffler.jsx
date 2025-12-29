import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Спокій", "Тиша", "Сон", "Ніч", "Зірки"];

  // 1. Попереднє завантаження голосів (критично для Android)
  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs.length > 0) setVoicesLoaded(true);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text, isWarmup = false) => {
    try {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel(); // Очищуємо чергу

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'uk-UA';
      utterance.rate = 0.7;
      utterance.volume = isWarmup ? 0 : 1.0; // "Прогрів" робимо беззвучним

      const voices = window.speechSynthesis.getVoices();
      const ukVoice = voices.find(v => v.lang.includes('uk'));
      if (ukVoice) utterance.voice = ukVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    try {
      if (isPlaying) {
        setIsPlaying(false);
        window.speechSynthesis.cancel();
        return;
      }

      setIsPlaying(true);
      
      // КРОК 1: Миттєвий беззвучний прогрів для розблокування
      speak(".", true); 

      // КРОК 2: Затримка 200мс перед першим реальним словом
      // Це дає WebView час активувати аудіо-канал
      setTimeout(() => {
        const firstWord = words[Math.floor(Math.random() * words.length)];
        setWord(firstWord);
        speak(firstWord);
      }, 200);

    } catch (error) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        speak(nextWord);
      }, 6000);
    }
    return () => {
      clearInterval(interval);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-4xl text-white font-light tracking-widest"
          >
            {word}
          </motion.h1>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl text-white/50 tracking-widest uppercase italic font-light">Когнітивний потік</h2>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`mt-12 px-10 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 ${
          isPlaying ? 'bg-red-500/10 text-red-200 border-red-500/20' : 'bg-white/5 text-white'
        }`}
      >
        {isPlaying ? 'ЗУПИНИТИ' : 'ПОЧАТИ ЗАНУРЕННЯ'}
      </button>

      {/* Візуальна пульсація під час роботи */}
      <div className="mt-10 flex gap-2">
        {isPlaying && [1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            className="w-1.5 h-1.5 bg-white/40 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};