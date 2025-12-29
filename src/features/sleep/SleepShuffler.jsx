import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wordsList from '../../data/words.json';

export const SleepShuffler = ({ onFinish }) => {
  const [word, setWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // Функція озвучки
  const speak = useCallback((text) => {
    if (!synthRef.current) return;

    // 1. Зупиняємо попередній звук (важливо для iOS)
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uk-UA'; // Українська мова
    utterance.rate = 0.8;     // Повільно
    utterance.pitch = 1;

    // 2. iOS іноді "ковтає" звук, якщо не вибрати голос явно
    // (опціонально, але бажано для стабільності)
    const voices = synthRef.current.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('uk'));
    if (ukVoice) utterance.voice = ukVoice;

    synthRef.current.speak(utterance);
  }, []);

  // Обробник старту
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      synthRef.current.cancel();
    } else {
      // --- ХАК ДЛЯ МОБІЛЬНИХ ---
      // Ми запускаємо озвучку ПЕРШОГО слова прямо тут, в момент кліку.
      // Це дає браузеру зрозуміти, що юзер дозволив аудіо.
      const firstWord = wordsList[Math.floor(Math.random() * wordsList.length)];
      setWord(firstWord);
      
      // Створюємо "пустий" звук для розблокування аудіо-контексту (іноді допомагає)
      const silentUtterance = new SpeechSynthesisUtterance(" ");
      synthRef.current.speak(silentUtterance);
      
      // Озвучуємо перше слово
      speak(firstWord);
      
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        setWord(randomWord);
        speak(randomWord);
      }, 5000); // 5 секунд інтервал
    }
    return () => {
      clearInterval(interval);
      // Не скасовуємо звук тут при розмонтуванні, щоб договорило фразу
    };
  }, [isPlaying, speak]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.h1
            key={word}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(5px)" }}
            transition={{ duration: 1.5 }}
            className="text-4xl md:text-5xl font-light tracking-widest text-white mb-10 mt-10"
          >
            {word}
          </motion.h1>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 mt-10">
            <h2 className="text-xl text-white/50 tracking-[0.2em] uppercase">Когнітивний потік</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={togglePlay}
        className={`
          px-10 py-4 rounded-full border border-white/10 uppercase tracking-[0.2em] text-xs transition-all active:scale-95
          ${isPlaying ? 'bg-red-500/10 text-red-200 border-red-500/20' : 'bg-white/5 text-white hover:bg-white/10'}
        `}
      >
        {isPlaying ? 'Зупинити' : 'Почати занурення'}
      </button>

      {/* Підказка для iOS, якщо звук не працює */}
      {!isPlaying && (
        <p className="mt-6 text-[10px] text-white/20 max-w-xs">
          *Якщо немає звуку: перевірте, чи вимкнено беззвучний режим (важіль збоку на iPhone)
        </p>
      )}
    </div>
  );
};