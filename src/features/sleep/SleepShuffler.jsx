import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Стейт для лоадера
  const audioRef = useRef(new Audio());

  const wordsData = [
    { id: 1, text: "Яблуко" }, { id: 2, text: "Хмара" }, { id: 3, text: "Океан" },
    { id: 4, text: "Гітара" }, { id: 5, text: "Ліс" }, { id: 6, text: "Свічка" },
    { id: 7, text: "Книга" }, { id: 8, text: "Гора" }, { id: 9, text: "Пісок" },
    { id: 10, text: "Собака" }
  ];

  const playLocalWord = (wordObj) => {
    const audio = audioRef.current;
    audio.src = `/audio/words/${wordObj.id}.mp3`;
    audio.load();
    audio.play().catch(e => console.warn("Аудіо заблоковано"));
  };

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
      return;
    }

    // 1. Вмикаємо лоадер
    setIsLoading(true);

    // 2. Вибираємо слово заздалегідь
    const firstWord = wordsData[Math.floor(Math.random() * wordsData.length)];
    
    // 3. Робимо коротку паузу (лоадер), щоб браузер встиг ініціалізувати аудіо-движок
    setTimeout(() => {
      setWord(firstWord.text);
      setIsLoading(false);
      setIsPlaying(true);
      playLocalWord(firstWord);
    }, 1200); // 1.2 секунди на лоадер
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = wordsData[Math.floor(Math.random() * wordsData.length)];
        setWord(nextWord.text);
        playLocalWord(nextWord);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-[75vh] text-center px-6">
      <AnimatePresence mode="wait">
        {isLoading ? (
          // ЕКРАН ЗАВАНТАЖЕННЯ
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Налаштування потоку...</p>
          </motion.div>
        ) : isPlaying ? (
          // ЕКРАН ПРАКТИКИ
          <motion.div
            key={word}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(8px)' }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl text-white font-extralight tracking-[0.2em] mb-8 uppercase">
              {word}
            </h1>
            <div className="w-32 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                key={`bar-${word}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7, ease: "linear" }}
                className="h-full bg-white/30"
              />
            </div>
          </motion.div>
        ) : (
          // ГОЛОВНИЙ ЕКРАН
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6"
          >
            <h2 className="text-xl text-white/40 tracking-[0.3em] uppercase font-light">
              Когнітивний потік
            </h2>
            <p className="text-[10px] text-white/20 leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.15em]">
              Слухай слова та візуалізуй образи, щоб зупинити потік думок
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        disabled={isLoading}
        className={`mt-20 px-12 py-5 rounded-full border border-white/10 uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 ${
          isPlaying ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
        } ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {isPlaying ? 'ЗУПИНИТИ' : 'ПОЧАТИ'}
      </button>
    </div>
  );
};