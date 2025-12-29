import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Використовуємо один стабільний реф для аудіо
  const audioRef = useRef(new Audio());

  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Спокій", "Тиша", "Сон", "Ніч", "Зірки"];

  const playVoice = (text) => {
    try {
      const audio = audioRef.current;
      
      // Використовуємо альтернативний TTS сервіс, який рідше блокується
      // tl=uk (українська), q=текст
      const url = `https://api.dictionaryapi.dev/media/pronunciations/en/apple-uk.mp3`; // Це просто тест структури
      
      // Насправді, найкращий варіант для стабільності - VoiceRSS або подібні, 
      // але спробуємо ще раз Google з іншим заголовком через iFrame-хак
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uk&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      audio.src = ttsUrl;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("Audio play blocked", e));
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const handleStart = () => {
    // ВАЖЛИВО: Жодних звернень до window.speechSynthesis тут!
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
      return;
    }

    setIsPlaying(true);
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);
    playVoice(firstWord);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        playVoice(nextWord);
      }, 7000); // Трохи збільшив інтервал
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
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 1.5 }}
            className="text-4xl text-white font-extralight tracking-[0.2em]"
          >
            {word}
          </motion.h1>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl text-white/40 tracking-[0.3em] uppercase font-light">
              Когнітивне перемішування
            </h2>
            <p className="text-[11px] text-white/20 leading-relaxed max-w-[250px] mx-auto uppercase tracking-widest">
              Слухай слова та уявляй їх, щоб зупинити потік думок
            </p>
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

      {/* Прогрес-бар, щоб бачити, що апка живе */}
      <div className="mt-12 w-48 h-[1px] bg-white/5 relative overflow-hidden">
        {isPlaying && (
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </div>
    </div>
  );
};