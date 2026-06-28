'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-secondary/20 dark:bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col"
          >
            <div className="p-6 pb-0 flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${isDestructive ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-50 text-primary dark:bg-orange-900/30'}`}>
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-lg text-secondary dark:text-white leading-tight mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
              </div>
            </div>
            
            <div className="p-6 flex gap-3 mt-2">
              <button 
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onCancel(); // Close after confirm
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-sm ${
                  isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-200/50 dark:shadow-none' 
                  : 'bg-primary hover:bg-orange-600 shadow-orange-200/50 dark:shadow-none'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
