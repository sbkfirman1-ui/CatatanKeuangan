'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';

export default function IntroScreen() {
  const { isAppLocked, setIsAppLocked } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Optional: Only show intro once per session/device
    // if (sessionStorage.getItem('hasSeenIntro')) {
    //   setShowIntro(false);
    // }
  }, []);

  const handleEnter = () => {
    setIsAppLocked(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isAppLocked && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply dark:mix-blend-lighten" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-300/20 dark:bg-orange-900/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 mix-blend-multiply dark:mix-blend-lighten" />

          <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl w-full px-6">
            
            {/* Photo Animation */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-64 h-80 md:w-80 md:h-96 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 mb-10 group bg-gray-200 dark:bg-gray-800"
            >
              <Image 
                src="/intro-photo.jpg" 
                alt="Intro Photo" 
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Fallback gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6">
                 <Heart className="text-white animate-pulse" size={32} />
              </div>
            </motion.div>

            {/* Text Title Animation */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative mb-12 text-center"
            >
              <h1 className="text-3xl md:text-5xl font-extrabold text-secondary dark:text-white tracking-tight relative z-10">
                Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Rumah Kita</span>
              </h1>
            </motion.div>

            {/* Action Button - Shape Text */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="group relative bg-white dark:bg-gray-900 px-8 py-5 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 cursor-pointer hover:border-primary transition-all"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-900 rotate-45 border-l border-t border-gray-100 dark:border-gray-800 rounded-sm"></div>
              <span className="font-bold text-xl text-secondary dark:text-white">Menuju Financial Stable</span>
              <div className="bg-primary text-white p-2 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={20} />
              </div>
            </motion.button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
