import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  
  const cardStyle = "relative h-32 bg-white/5 border border-white/10 rounded-[24px] p-6 flex flex-col justify-center overflow-hidden group active:scale-95 transition-all";

  return (
    <div className="min-h-screen w-full bg-[#050505] p-6 flex flex-col justify-center">
      <header className="mb-12 text-center">
        <h1 className="text-3xl text-white font-light tracking-tight">Stoic Hub</h1>
        <p className="text-white/30 text-xs tracking-[0.3em] uppercase mt-2">Центр рівноваги</p>
      </header>

      <div className="grid gap-4">
        <motion.button 
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/breath')} 
          className={cardStyle}
        >
          <span className="text-2xl mb-2">🫁</span>
          <h3 className="text-xl text-white font-medium">Дихання</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Focus & Calm</p>
        </motion.button>

        <motion.button 
           initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
           onClick={() => navigate('/sleep')} 
           className={cardStyle}
        >
          <span className="text-2xl mb-2">🌙</span>
          <h3 className="text-xl text-white font-medium">Сон</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Deep Sleep</p>
        </motion.button>
      </div>
    </div>
  );
};

export default HomePage;