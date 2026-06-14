/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface SleepOverlayProps {
  onBypass: () => void;
  sleepStart: string; // e.g. "22:00"
  sleepEnd: string;   // e.g. "06:00"
}

export function SleepOverlay({ onBypass, sleepStart, sleepEnd }: SleepOverlayProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-gray-500 cursor-none select-none transition-all"
    >
      <div className="absolute top-6 left-6 flex items-center space-x-3 text-xs opacity-30 select-none">
        <Moon className="w-4 h-4 animate-pulse" />
        <span>СИСТЕМА ТЕРМИНАЛА TPU-ROSATOM: РЕЖИМ СВЕРХМАЛОГО ЭНЕРГОПОТРЕБЛЕНИЯ</span>
      </div>

      <div className="text-center space-y-6 max-w-lg p-6">
        <motion.div 
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-7xl font-mono tracking-widest text-zinc-800"
        >
          {currentTime}
        </motion.div>

        <p className="text-sm font-sans tracking-tight text-neutral-700 select-none">
          Экран переведен в энергосберегающий спящий режим по расписанию ({sleepStart} — {sleepEnd}).
          <br />
          Для защиты светодиодных панелей и экономии электроэнергии.
        </p>

        <div className="pt-8">
          <button
            onClick={onBypass}
            className="cursor-pointer px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 mx-auto shadow-inner"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>ВРЕМЕННО РАЗБУДИТЬ ЭКРАН (ОТЛАДКА)</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 text-[10px] text-zinc-800 font-mono tracking-widest">
        ТПУ / РОСАТОРМ ГЕОСЕРВИС © 2026
      </div>
    </motion.div>
  );
}
