import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // Твій список слів, які ти вже додав у public/audio/words/
  const wordsData = [
    { id: 1, text: "Яблуко" },
    { id: 2, text: "Хмара" },
    { id: 3, text: "Океан" },
    { id: 4, text: "Гітара" },
    { id: 5, text: "Ліс" },
    { id: 6, text: "Свічка" },
    { id: 7, text: "Книга" },
    { id: 8, text: "Гора" },
    { id: 9, text: "Пісок" },
    { id: 10, text: "Собака" }
    // Додай сюди решту своїх слів
  ];

const playLocalWord = (wordObj) => {
    try {
      const audio = audioRef.current;
      audio.src = `/audio/words/${wordObj.id}.mp3`;
      
      // Примусово завантажуємо файл
      audio.load();

      // Використовуємо проміс для відтворення, щоб уникнути помилок переривання
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("Аудіо заблоковано або не встигло завантажитись"));
      }
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

    // Отримуємо перше слово відразу
    const firstWord = wordsData[Math.floor(Math.random() * wordsData.length)];
    
    // Спочатку міняємо стейт
    setWord(firstWord.text);
    setIsPlaying(true);

    // І ТУТ ЖЕ запускаємо звук, не чекаючи ні мілісекунди
    playLocalWord(firstWord);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = wordsData[Math.floor(Math.random() * wordsData.length)];
        setWord(nextWord.text);
        playLocalWord(nextWord);
      }, 7000); // Інтервал 7 секунд
    }
    return () => {
      clearInterval(interval);
      audioRef.current.pause();
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-[75vh] text-center px-6">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.div
            key={word}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(8px)' }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl text-white font-extralight tracking-[0.2em] mb-8">
              {word}
            </h1>
            
            {/* Прогрес-бар під словом */}
            <div className="w-32 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                key={`bar-${word}`} // Перезапускає анімацію для кожного слова
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7, ease: "linear" }}
                className="h-full bg-white/30"
              />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl text-white/40 tracking-[0.3em] uppercase font-light">
              Когнітивний потік
            </h2>
            <p className="text-[10px] text-white/20 leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.15em]">
              Слухай слова та візуалізуй образи, щоб зупинити потік думок
            </p>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`mt-20 px-12 py-5 rounded-full border border-white/10 uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 ${
          isPlaying ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
        }`}
      >
        {isPlaying ? 'ЗУПИНИТИ' : 'ПОЧАТИ'}
      </button>

      {!isPlaying && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-[9px] text-white/10 uppercase tracking-[0.2em]"
        >
          Ефективно при безсонні
        </motion.p>
      )}
    </div>
  );
};