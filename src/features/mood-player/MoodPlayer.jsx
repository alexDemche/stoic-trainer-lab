import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Volume2, VolumeX } from 'lucide-react';

export const MoodPlayer = ({ mood,duration, onBack }) => {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState("Вдих");
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration || 300); // 5 хвилин

  const phaseDuration = 4;
  const tg = window.Telegram?.WebApp;

  // Реф для звуку гонгу
  const gongRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"));

  // 1. Ініціалізація звуку та зображень
  useEffect(() => {
    const gong = gongRef.current;
    gong.volume = 0.2;
    gong.preload = "auto";
    gong.load();

    if (!mood) return;
    setIsReady(false);
    
    const searchQueries = { 
      love: 'couple,romance,tender', 
      money: 'wealth,luxury,gold', 
      energy: 'fire,dynamic,abstract', 
      calm: 'mist,zen,ocean', 
      focus: 'geometry,minimal,space' 
    };
    const query = searchQueries[mood.id] || 'abstract';

    const newImages = Array.from({ length: 15 }, (_, i) => 
      `https://loremflickr.com/800/1200/${query}/all?lock=${i + 3000}`
    );

    const img = new Image();
    img.src = newImages[0];
    img.onload = () => {
      setImages(newImages);
      setTimeout(() => setIsReady(true), 2500); 
    };
    img.onerror = () => {
      setImages(newImages);
      setIsReady(true);
    };

    return () => {
      gong.pause();
      gong.currentTime = 0;
    };
  }, [mood]);

  // 2. Єдиний цикл для таймера, фаз дихання та звуку
  useEffect(() => {
    if (!isReady || timeLeft <= 0) return;

    const phases = ["Вдих", "Затримка", "Видих", "Затримка "];
    let currentPhaseIdx = 0;
    let secondsInPhase = 0;

    const mainTimer = setInterval(() => {
      // Керування загальним часом сесії
      setTimeLeft(prev => prev - 1);

      // Керування фазами дихання (кожні 4 секунди)
      secondsInPhase++;
      if (secondsInPhase >= phaseDuration) {
        secondsInPhase = 0;
        currentPhaseIdx = (currentPhaseIdx + 1) % 4;
        
        const currentPhaseName = phases[currentPhaseIdx];
        setPhase(currentPhaseName);

        // Вібрація Telegram
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred('light');
        }

        // Відтворення звуку гонгу
        if (!isMuted) {
          gongRef.current.currentTime = 0;
          gongRef.current.play().catch(e => console.log("Audio blocked"));
        }

        // Зміна фону на початку кожного повного циклу (Вдих)
        if (currentPhaseIdx === 0) {
          setIndex(prev => (prev + 1) % (images.length || 1));
        }
      }
    }, 1000);

    return () => clearInterval(mainTimer);
  }, [isReady, isMuted, images.length, tg]);

  const isExpanded = phase === "Вдих" || phase === "Затримка";

  // Loader
  if (!isReady) return (
    <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-white p-10">
      <div className="relative flex items-center justify-center mb-10">
        <motion.div 
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-32 h-32 bg-white blur-3xl rounded-full"
        />
        <motion.div 
          animate={{ borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.1)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 border-2 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      </div>
      <h2 className="text-white text-xl font-light tracking-[0.4em] uppercase">Приготуйся</h2>
      <p className="mt-4 text-white/30 text-[10px] uppercase tracking-[0.2em] italic text-center">
        Налаштування потоку: {mood?.label}
      </p>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center text-white font-sans">
      
      {/* ПАНЕЛЬ КЕРУВАННЯ */}
      <div className="absolute top-12 w-full px-10 z-50 flex justify-between items-center">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="p-2 text-white/20 hover:text-white/60 transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <span className="text-white/20 text-[10px] font-mono tracking-[0.5em] italic">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>

        <button onClick={onBack} className="p-2 text-white/30 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* ФОТО ТА ОВЕРЛЕЙ */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4 }}
            className="w-full h-full object-cover brightness-[0.45]"
          />
        </AnimatePresence>
        
        <motion.div 
          animate={{ opacity: isExpanded ? 0 : 0.35 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="absolute inset-0 bg-black z-10 pointer-events-none"
        />
      </div>

      {/* КОЛО */}
      <div className="relative z-30 mb-40">
        <motion.div 
          animate={{ scale: isExpanded ? 1.4 : 1 }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="w-44 h-44 border border-white/30 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-[1.5px] shadow-[0_0_40px_rgba(255,255,255,0.02)]"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-[11px] text-white/70 uppercase tracking-[0.5em] font-light"
            >
              {phase.trim()}
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
            className="text-white/90 text-2xl md:text-3xl font-light italic tracking-wide leading-relaxed drop-shadow-2xl"
          >
            {mood.affirmations[index % mood.affirmations.length]}
          </motion.h2>
        </AnimatePresence>
      </div>
      
      {/* ФІНАЛ */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 text-center"
          >
            <h2 className="text-white text-xl font-light tracking-[0.5em] uppercase mb-10">Спокій досягнуто</h2>
            <button 
              onClick={onBack} 
              className="text-white/50 text-xs uppercase tracking-[0.3em] border border-white/10 px-10 py-4 active:scale-95"
            >
              Закрити
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};