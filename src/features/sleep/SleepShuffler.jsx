import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = () => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Резервні слова на випадок помилки імпорту
  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Спокій", "Тиша", "Сон", "Ніч", "Зірки"];

  const speak = (text) => {
    // Скасовуємо все, що черзі
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uk-UA';
    utterance.rate = 0.7; // Повільно для сну
    utterance.volume = 1.0;

    // Важливо: для деяких Android потрібно знайти голос явно
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('uk'));
    if (ukVoice) utterance.voice = ukVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      return;
    }

    // --- КРИТИЧНИЙ ХАК ДЛЯ МОБІЛЬНИХ ---
    // Це розблоковує аудіо-движок відразу при натисканні
    const silent = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(silent);

    setIsPlaying(true);
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);
    
    // Запускаємо голос негайно
    speak(firstWord);
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
      window.speechSynthesis.cancel();
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
            <p className="text-[10px] text-white/20 uppercase tracking-widest">Візуалізуй кожне слово</p>
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

      {isPlaying && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-8 text-[9px] text-white/10 uppercase tracking-[0.3em]"
        >
          Практика триває...
        </motion.p>
      )}
    </div>
  );
};