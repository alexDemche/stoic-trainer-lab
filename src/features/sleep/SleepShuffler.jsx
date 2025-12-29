import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Спокій", "Тиша", "Сон", "Ніч", "Зірки"];

  const playVoice = (text) => {
    try {
      const audio = audioRef.current;
      
      // Використовуємо VoiceRSS API (безкоштовний тир)
      // hl=uk-ua (українська), c=MP3, f=8khz_8bit_mono (легкий файл для швидкого завантаження)
      const apiKey = "6f81014841964177894d01b1a7d65609"; // Тимчасовий ключ для тесту
      const url = `https://api.voicerss.org/?key=${apiKey}&hl=uk-ua&src=${encodeURIComponent(text)}&c=MP3&f=16khz_16bit_stereo`;
      
      audio.src = url;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("Audio blocked:", e));
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
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
    
    // Активуємо аудіо-контекст першим кліком
    playVoice(firstWord);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        playVoice(nextWord);
      }, 7000);
    }
    return () => {
      clearInterval(interval);
      audioRef.current.pause();
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-4xl text-white font-extralight tracking-[0.2em]"
          >
            {word}
          </motion.h1>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl text-white/40 tracking-[0.3em] uppercase font-light">
              Когнітивне перемішування
            </h2>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={handleStart}
        className={`mt-16 px-12 py-5 rounded-full border border-white/10 uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 ${
          isPlaying ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
        }`}
      >
        {isPlaying ? 'ЗУПИНИТИ' : 'ПОЧАТИ'}
      </button>

      {/* Маленька підказка знизу */}
      {isPlaying && (
        <p className="mt-8 text-[8px] text-white/10 uppercase tracking-[0.2em]">
          Слухай та візуалізуй образи
        </p>
      )}
    </div>
  );
};