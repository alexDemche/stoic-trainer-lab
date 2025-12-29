import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Створюємо реф на аудіо за аналогією з gongRef у Breath Flow
  const audioRef = useRef(new Audio());

  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Сон", "Тиша", "Спокій", "Темрява", "Зірки"];

  const playWord = (text) => {
    const audio = audioRef.current;
    
    // Формуємо посилання (додаємо проксі-параметри для кращої сумісності)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uk&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    audio.src = url;
    audio.load(); // Примусове завантаження

    // Важливо: граємо лише після кліку або в активному стані
    audio.play().catch(e => console.log("Playback blocked or failed:", e));
  };

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
      return;
    }

    setIsPlaying(true);
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);

    // "Розблоковуємо" аудіо-движок першим звуком
    playWord(firstWord);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        playWord(nextWord);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Очистка при виході
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

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
          <h2 className="text-xl text-white/50 tracking-widest uppercase italic">Когнітивний потік</h2>
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

      {!isPlaying && (
        <p className="mt-6 text-[9px] text-white/20 uppercase tracking-[0.2em]">
          Техніка когнітивного перемішування
        </p>
      )}
    </div>
  );
};