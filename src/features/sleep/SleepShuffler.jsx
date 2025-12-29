import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = ({ onFinish }) => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState(["Готовий до сну..."]);

  // Використовуємо ref для аудіо, щоб мати змогу зупинити його
  const audioRef = useRef(null);

  const addLog = (msg) => {
    // console.log(msg); // Можна розкоментувати для дебагу в консолі
    setLogs(prev => [msg, ...prev].slice(0, 3));
  };

  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Сон", "Спокій", "Тиша"];

  // --- НОВА ФУНКЦІЯ ОЗВУЧКИ (MP3) ---
  const playAudio = (text) => {
    try {
      // Зупиняємо попередній звук, якщо він є
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Формуємо URL для Google Translate TTS API
      // client=tw-ob - це публічний клієнт, tl=uk - українська мова
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=uk&q=${encodeURIComponent(text)}`;
      
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => addLog(`🔊 Грає: ${text}`);
      audio.onerror = (e) => addLog(`❌ Помилка аудіо: ${e.type}`);

      // Запускаємо
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          addLog(`⚠️ Блокування: ${error.message}`);
        });
      }
    } catch (e) {
      addLog(`❌ Crash: ${e.message}`);
    }
  };

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      addLog("⏹️ Зупинено");
      return;
    }

    addLog("🟢 Старт");
    
    // Вибираємо слово
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);
    setIsPlaying(true);

    // Запускаємо звук відразу
    playAudio(firstWord);
  };

  // Таймер
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        playAudio(nextWord);
      }, 5000); // Інтервал 5 секунд
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Очистка при виході
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center relative">
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
          <div className="mb-10 mt-10">
            <h2 className="text-xl text-white/50 tracking-[0.2em] uppercase">Когнітивний потік</h2>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`px-10 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${isPlaying ? 'bg-red-500/10 text-red-200' : 'bg-white/5 text-white'}`}
      >
        {isPlaying ? 'Зупинити' : 'Почати'}
      </button>

      {/* Логер можна залишити маленьким або прибрати пізніше */}
      <div className="absolute bottom-5 text-[9px] text-white/20 font-mono">
        {logs[0]}
      </div>
    </div>
  );
};