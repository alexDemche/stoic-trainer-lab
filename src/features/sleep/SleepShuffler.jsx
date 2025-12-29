import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // Список слів, для яких у тебе Є файли в папці public/audio/words/
  const wordsData = [
    { id: 1, text: "Яблуко" },
    { id: 2, text: "Хмара" },
    { id: 3, text: "Океан" },
    { id: 4, text: "Гітара" },
    { id: 5, text: "Ліс" },
    // Додай сюди стільки, скільки запишеш файлів
  ];

  const playLocalWord = (wordObj) => {
    try {
      const audio = audioRef.current;
      // Звертаємось до файлу в папці public
      audio.src = `/audio/words/${wordObj.id}.mp3`;
      audio.load();
      audio.play().catch(e => console.log("Audio block:", e));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
      return;
    }

    setIsPlaying(true);
    const randomIndex = Math.floor(Math.random() * wordsData.length);
    const firstWord = wordsData[randomIndex];
    setWord(firstWord.text);
    playLocalWord(firstWord);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * wordsData.length);
        const nextWord = wordsData[randomIndex];
        setWord(nextWord.text);
        playLocalWord(nextWord);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-4xl text-white font-extralight tracking-widest"
          >
            {word}
          </motion.h1>
        ) : (
          <h2 className="text-xl text-white/30 tracking-[0.3em] uppercase font-light">
            Когнітивний потік
          </h2>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`mt-16 px-12 py-5 rounded-full border border-white/10 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 ${
          isPlaying ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
        }`}
      >
        {isPlaying ? 'ЗУПИНИТИ' : 'ПОЧАТИ'}
      </button>
    </div>
  );
};