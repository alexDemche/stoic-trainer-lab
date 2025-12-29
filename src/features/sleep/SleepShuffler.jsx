import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Спокій", "Тиша", "Сон", "Ніч", "Зірки"];

  const speak = (text) => {
    try {
      // Перевірка наявності API
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'uk-UA';
      utterance.rate = 0.7;
      utterance.volume = 1.0;

      // Безпечне отримання голосів
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const ukVoice = voices.find(v => v.lang.includes('uk'));
        if (ukVoice) utterance.voice = ukVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech error caught:", error);
    }
  };

  const handleStart = () => {
    try {
      if (isPlaying) {
        setIsPlaying(false);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        return;
      }

      // Активація через пустий звук (синхронно з кліком)
      if (window.speechSynthesis) {
        const silent = new SpeechSynthesisUtterance(" ");
        window.speechSynthesis.speak(silent);
      }

      setIsPlaying(true);
      const firstWord = words[Math.floor(Math.random() * words.length)];
      setWord(firstWord);
      
      // Виклик озвучки
      speak(firstWord);
    } catch (error) {
      console.error("HandleStart crash prevented:", error);
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
            <h2 className="text-xl text-white/50 tracking-widest uppercase italic">Когнітивний потік</h2>
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

      <div className="mt-10 h-1 w-32 bg-white/5 rounded-full overflow-hidden">
        {isPlaying && (
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="h-full bg-white/20"
          />
        )}
      </div>
    </div>
  );
};