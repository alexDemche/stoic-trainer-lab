import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { MOOD_CONFIG } from '../../data/moodConfig';

export const MoodPlayer = ({ mood, duration, onBack }) => {
  // --- СТАН (STATE) ---
  const [index, setIndex] = useState(0); // Індекс поточного фото
  const [images, setImages] = useState([]); // Плейлист фото
  const [isReady, setIsReady] = useState(false); // Чи завантажені фото
  const [isStarted, setIsStarted] = useState(false); // Чи натиснуто "Старт"
  const [phase, setPhase] = useState("Вдих"); // Текст фази
  const [activePhaseIdx, setActivePhaseIdx] = useState(0); // 0:Вдих, 1:Затримка, 2:Видих, 3:Затримка
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration || 300);

  const phaseDuration = 4; // 4 секунди на кожну фазу (Квадратне дихання)
  const tg = window.Telegram?.WebApp;
  const gongRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"));

  // 1. Ініціалізація: Telegram, Аудіо та Рандомайзер фото
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setTimeout(() => tg.expand(), 200);
    }

    const gong = gongRef.current;
    gong.volume = 0.2;
    gong.load();

    if (!mood) return;
    setIsReady(false);

    // Логіка створення випадкового плейлиста з локальних WebP фото
    const config = MOOD_CONFIG[mood.id] || MOOD_CONFIG.calm;
    const generateRandomPlaylist = () => {
      const total = config.totalImages;
      const nums = Array.from({ length: total }, (_, i) => i + 1);
      // Перемішування Фішера-Єйтса
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      return nums.map(num => `${config.basePath}${num}.webp`);
    };

    const playlist = generateRandomPlaylist();

    // Прелоад першої картинки для миттєвого старту
    const firstImg = new Image();
    firstImg.src = playlist[0];
    firstImg.onload = () => {
      setImages(playlist);
      setTimeout(() => setIsReady(true), 1500);
    };
    firstImg.onerror = () => {
      setImages(playlist);
      setIsReady(true);
    };

    return () => {
      gong.pause();
      gong.currentTime = 0;
    };
  }, [mood, tg]);

  // 2. Wake Lock: Заборона вимкнення екрану під час практики
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    if (isStarted) requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isStarted) requestWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock?.release();
    };
  }, [isStarted]);

  // 3. ГОЛОВНИЙ ТАЙМЕР ТА ЦИКЛ ДИХАННЯ
  useEffect(() => {
    if (!isStarted || !isReady || timeLeft <= 0) return;

    const phases = ["Вдих", "Затримка", "Видих", "Затримка"];
    let secondsInPhase = 0;

    const mainTimer = setInterval(() => {
      // 1. Відлік загального часу
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));

      // 2. Логіка фаз дихання
      secondsInPhase++;
      if (secondsInPhase >= phaseDuration) {
        secondsInPhase = 0;

        // Оновлюємо індекс фази (0 -> 1 -> 2 -> 3 -> 0)
        setActivePhaseIdx((currentIdx) => {
          const nextIdx = (currentIdx + 1) % 4;
          setPhase(phases[nextIdx]);

          // Вібрація (безпечна перевірка для старих версій Telegram)
          if (tg?.HapticFeedback?.impactOccurred) {
            try {
              tg.HapticFeedback.impactOccurred('light');
            } catch (e) {}
          }

          // Звуковий сигнал (гонг)
          if (!isMuted) {
            gongRef.current.currentTime = 0;
            gongRef.current.play().catch(() => {});
          }

          // Зміна фонового фото (тільки на початку нового повного циклу)
          if (nextIdx === 0) {
            setIndex(prev => (prev + 1) % (images.length || 1));
          }

          return nextIdx;
        });
      }
    }, 1000);

    return () => clearInterval(mainTimer);
  }, [isStarted, isReady, isMuted, images.length, tg]);

  const handleStart = () => {
    setIsStarted(true);
    // Розблокування аудіо для мобільних браузерів
    gongRef.current.play().then(() => {
      gongRef.current.pause();
      gongRef.current.currentTime = 0;
    }).catch(() => {});
  };

  // --- ЛОГІКА АНІМАЦІЇ КОЛА ---
  // Коло велике під час Вдиху (0) та першої Затримки (1)
  const isExpanded = activePhaseIdx === 0 || activePhaseIdx === 1;

  // Екран завантаження або очікування старту
  if (!isReady || !isStarted) return (
    <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-white p-10 text-center">
      <div className="relative flex items-center justify-center mb-10">
        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-32 h-32 bg-white blur-3xl rounded-full" />
        <div className="w-20 h-20 border-2 border-white/10 rounded-full flex items-center justify-center relative">
          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.h2 key="l" exit={{ opacity: 0 }} className="text-m font-light tracking-[0.4em] uppercase">Завантаження</motion.h2>
        ) : (
          <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <h2 className="text-xl font-light tracking-[0.4em] uppercase mb-8">Приготуйся</h2>
            <button 
              onClick={handleStart}
              className="px-10 py-4 border border-white/20 rounded-full text-[10px] uppercase tracking-[0.3em] bg-white/5 active:scale-95 transition-all"
            >
              Увійти в потік
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center text-white font-sans">
      
      {/* ПАНЕЛЬ КЕРУВАННЯ */}
      <div className="absolute top-8 md:top-12 w-full px-6 z-50 flex justify-between items-center">
        <button 
          onClick={onBack} 
          className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>

        <span className="text-white/40 text-[10px] font-mono tracking-[0.5em] italic">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>

        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* ФОНОВІ ЗОБРАЖЕННЯ */}
      <div className="absolute inset-0 z-0">
        {/* 1. Прибираємо mode="wait" для паралельної анімації */}
        <AnimatePresence>
          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 2. Я трохи зменшив час до 2.5с, бо 4с для крос-фейду може бути задовго.
            // Спробуй так, якщо захочеться повільніше - повернеш 4.
            transition={{ duration: 2.5, ease: "easeInOut" }}
            // 3. ВАЖЛИВО: Додаємо 'absolute inset-0', щоб картинки накладалися
            className="absolute inset-0 w-full h-full object-cover brightness-[0.45]"
          />
        </AnimatePresence>
        
        {/* Затемнюючий шар */}
        <motion.div 
          animate={{ opacity: isExpanded ? 0 : 0.35 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="absolute inset-0 bg-black z-10 pointer-events-none"
        />
      </div>

      {/* ДИХАЛЬНЕ КОЛО */}

      <div className="relative z-30 mb-40">
        <motion.div 
          animate={{ scale: isExpanded ? 1.4 : 1 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="w-44 h-44 border border-white/30 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-[2px]"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-[11px] text-white/70 uppercase tracking-[0.5em] font-light"
            >
              {phase}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* АФІРМАЦІЯ */}
      <div className="absolute bottom-32 w-full z-40 text-center px-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 2.5 }}
            className="text-white/90 text-2xl md:text-3xl font-light italic tracking-wide leading-relaxed"
          >
            {mood.affirmations[index % mood.affirmations.length]}
          </motion.h2>
        </AnimatePresence>
      </div>
      
      {/* ЕКРАН ЗАВЕРШЕННЯ */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 text-center"
          >
            <h2 className="text-white text-xl font-light tracking-[0.5em] uppercase mb-10">Спокій досягнуто</h2>
            <button 
              onClick={onBack} 
              className="text-white/50 text-xs uppercase tracking-[0.3em] border border-white/10 px-10 py-4 active:scale-95 transition-all"
            >
              Закрити
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};