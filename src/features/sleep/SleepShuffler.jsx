import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Сон", "Тиша", "Спокій", "Темрява", "Зірки"];

  const playAudio = (text) => {
    // 1. Очищуємо попередній аудіо-об'єкт, якщо він був
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    // 2. Використовуємо альтернативне посилання з фіксованим клієнтом
    // Це посилання зазвичай працює стабільніше для мобільних WebView
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=uk&client=tw-ob`;
    
    const audio = new Audio();
    audio.src = url;
    audioRef.current = audio;

    // 3. Спроба відтворення
    audio.play().catch(e => {
      console.error("Audio play failed:", e);
      // Якщо Google блокує, можна додати резервний варіант тут
    });
  };

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    setIsPlaying(true);
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);
    playAudio(firstWord);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        playAudio(nextWord);
      }, 6000); // 6 секунд дає час аудіо завантажитись і програтись
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis?.cancel(); // Про всяк випадок зупиняємо системний голос
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
          <h2 className="text-xl text-white/50 tracking-widest uppercase">Когнітивний потік</h2>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`mt-12 px-10 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-[10px] transition-all ${isPlaying ? 'bg-red-500/10 text-red-200' : 'bg-white/5 text-white'}`}
      >
        {isPlaying ? 'Зупинити' : 'Почати занурення'}
      </button>
    </div>
  );
};