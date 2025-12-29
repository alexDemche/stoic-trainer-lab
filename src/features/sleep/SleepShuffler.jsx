import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import importedWords from '../../data/words.json';

export const SleepShuffler = ({ onFinish }) => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [logs, setLogs] = useState(["Готовий до роботи..."]); // ЛОГИ

  // Функція для запису логів на екран
  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5)); // Тримаємо останні 5 логів
    console.log(msg);
  };

  const words = (importedWords && importedWords.length > 0) 
    ? importedWords 
    : ["Сон", "Тиша", "Спокій"];

  // 1. Завантаження голосів
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      addLog("❌ Speech API не підтримується цим браузером");
      return;
    }

    const loadVoices = () => {
      const vs = synth.getVoices();
      addLog(`🗣️ Голоси оновлено: знайдено ${vs.length}`);
      setVoices(vs);
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  // 2. Функція озвучки
  const speak = (text) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;

      synth.cancel(); // Скидання черги

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      
      // Спроба знайти голос
      const ukVoice = voices.find(v => v.lang.includes('uk')) || voices[0];
      if (ukVoice) {
        utterance.voice = ukVoice;
      }

      utterance.onstart = () => addLog(`▶️ Грає: ${text}`);
      utterance.onerror = (e) => addLog(`❌ Помилка озвучки: ${e.error}`);

      synth.speak(utterance);
    } catch (e) {
      addLog(`❌ Crash: ${e.message}`);
    }
  };

  // 3. Старт/Стоп
  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      addLog("⏹️ Зупинено користувачем");
      return;
    }

    addLog("🟢 Старт натиснуто");
    
    // Вибираємо слово
    const firstWord = words[Math.floor(Math.random() * words.length)];
    setWord(firstWord);
    setIsPlaying(true);

    // ВАЖЛИВО: Запускаємо відразу
    speak(firstWord);
  };

  // 4. Таймер
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        setWord(nextWord);
        speak(nextWord);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, voices]);

  // Очистка
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center relative">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-4xl font-light tracking-widest text-white mb-10 mt-10"
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
        className={`px-10 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-xs ${isPlaying ? 'bg-red-500/10' : 'bg-white/5'}`}
      >
        {isPlaying ? 'Зупинити' : 'Почати'}
      </button>

      {/* --- ЕКРАННИЙ ЛОГЕР (ДЛЯ ТЕСТУ) --- */}
      <div className="absolute bottom-0 w-full p-4 text-[10px] text-left font-mono text-green-400 bg-black/80 rounded-t-xl overflow-hidden pointer-events-none">
        <p className="text-white/50 border-b border-white/10 mb-2">SYSTEM LOGS:</p>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};