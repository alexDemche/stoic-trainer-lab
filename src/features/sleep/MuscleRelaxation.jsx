import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import steps from '../../data/relaxationSteps.json';

export const MuscleRelaxation = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextStep = currentStep + 1;
          if (nextStep < steps.length) {
            setCurrentStep(nextStep);
            return steps[nextStep].duration;
          } else {
            onFinish();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, onFinish]);

  const step = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-8"
      >
        <h2 className="text-white/40 text-xs uppercase tracking-[0.4em]">{step.part}</h2>
        
        <h1 className={`text-3xl font-light tracking-wide transition-colors duration-500 ${step.isTense ? 'text-red-200/80' : 'text-green-200/80'}`}>
          {step.action}
        </h1>

        <div className="text-5xl font-mono font-thin text-white/10">
          {timeLeft}
        </div>
      </motion.div>

      {/* Прогрес-бар знизу */}
      <div className="fixed bottom-10 left-10 right-10 h-[2px] bg-white/5">
        <motion.div 
          className="h-full bg-white/20"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};