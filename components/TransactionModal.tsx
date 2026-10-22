'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Wallet, AlertTriangle, ChevronDown, 
  Shield, Coffee, PiggyBank, Plane, Coins, Target, 
  ShoppingBag, Sparkles, Heart 
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';

const POCKET_ICON_MAP: Record<string, React.ReactNode> = {
  Wallet: <Wallet size={16} />,
  PiggyBank: <PiggyBank size={16} />,
  Shield: <Shield size={16} />,
  Target: <Target size={16} />,
  Coins: <Coins size={16} />,
  Plane: <Plane size={16} />,
  Coffee: <Coffee size={16} />,
  Heart: <Heart size={16} />,
  ShoppingBag: <ShoppingBag size={16} />,
  Sparkles: <Sparkles size={16} />
};

export default function TransactionModal() {
  const { 
    isTxModalOpen, 
    setIsTxModalOpen, 
    categories, 
    transactions, 
    setTransactions, 
    pockets, 
    allocatePocketFunds, 
    formatAmount 
  } = useUser();

  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txPocketId, setTxPocketId] = useState('');
  const [isPocketDropdownOpen, setIsPocketDropdownOpen] = useState(false);
  const [txNotes, setTxNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTxModalOpen) return null;

  const handleClose = () => {
    setIsTxModalOpen(false);
    setTxAmount('');
    setTxNotes('');
    setTxCategory('');
    setTxPocketId('');
    setIsPocketDropdownOpen(false);
  };

  const numericAmount = parseInt(txAmount.replace(/\D/g, ''), 10) || 0;
  const budgetPockets = pockets.filter(p => p.type === 'budget');
  const savingPockets = pockets.filter(p => p.type === 'saving');
  const selectedPocket = pockets.find(p => p.id === txPocketId);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txCategory || isSubmitting) return;

    setIsSubmitting(true);
    
    // Attach pocket tag to notes if a pocket was selected
    let finalNotes = txNotes.trim();
    if (selectedPocket) {
      finalNotes = finalNotes 
        ? `${finalNotes} • [Pocket: ${selectedPocket.name}]` 
        : `[Pocket: ${selectedPocket.name}]`;
    }

    const newTx = {
      id: Date.now(),
      name: txNotes.trim() || txCategory,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
      amount: txType === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount),
      type: txType,
      notes: finalNotes
    };

    try {
      const { data, error } = await supabase.from('transactions').insert([newTx]).select();
      if (!error && data) {
        setTransactions([data[0], ...transactions]);
      } else {
        // Fallback for offline or local state
        setTransactions([newTx, ...transactions]);
      }
    } catch (err) {
      setTransactions([newTx, ...transactions]);
    }

    // Automatically allocate/deduct funds from the selected pocket
    if (selectedPocket && numericAmount > 0) {
      allocatePocketFunds(
        selectedPocket.id,
        numericAmount,
        txType === 'expense' ? 'withdraw' : 'deposit',
        txNotes.trim() ? `${txNotes.trim()} (${txCategory})` : `Transaksi ${txCategory}`
      );
    }

    setIsSubmitting(false);
    handleClose();
  };

  const availableCategories = categories.filter(c => c.type === txType);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-[2rem] shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-primary/5 dark:bg-primary/10 shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-secondary dark:text-white">Input Transaksi</h2>
              <p className="text-xs text-gray-400 mt-0.5">Catat arus kas baru & alokasi pos pocket</p>
            </div>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSaveTransaction} className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
            {/* Type Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-xl shrink-0">
              <button 
                type="button"
                onClick={() => { setTxType('expense'); setTxCategory(''); setIsPocketDropdownOpen(false); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  txType === 'expense' 
                    ? 'bg-white dark:bg-gray-700 text-accent shadow-sm' 
                    : 'text-gray-500 hover:text-secondary dark:text-gray-400'
                }`}
              >
                Pengeluaran
              </button>
              <button 
                type="button"
                onClick={() => { setTxType('income'); setTxCategory(''); setIsPocketDropdownOpen(false); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  txType === 'income' 
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-gray-500 hover:text-secondary dark:text-gray-400'
                }`}
              >
                Pemasukan
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Nominal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                <input 
                  type="text"
                  inputMode="numeric"
                  value={txAmount}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    if (!rawValue) {
                      setTxAmount('');
                    } else {
                      setTxAmount(parseInt(rawValue, 10).toLocaleString('id-ID'));
                    }
                  }} 
                  placeholder="0"
                  autoFocus
                  required
                  className="w-full border-none rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/70 font-bold text-xl text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition-all"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Kategori</label>
              <select 
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                required
                className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-800/70 font-medium text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Pilih Kategori...</option>
                {availableCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Modern Pocket Selector (Pos Anggaran / Pos Tabungan) */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-600 dark:text-gray-300">
                  {txType === 'expense' ? 'Sumber Dana Pocket' : 'Alokasi ke Pocket'}
                </label>
                <span className="text-[11px] text-gray-400 font-medium">Opsional</span>
              </div>

              {/* Custom Trigger Card */}
              <button
                type="button"
                onClick={() => setIsPocketDropdownOpen(!isPocketDropdownOpen)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                  isPocketDropdownOpen 
                    ? 'bg-white dark:bg-gray-800 border-primary ring-2 ring-primary/20 shadow-md' 
                    : 'bg-gray-50 dark:bg-gray-800/70 border-gray-200/70 dark:border-gray-700/80 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedPocket 
                      ? 'bg-primary/10 text-primary dark:bg-primary/25' 
                      : 'bg-gray-200/70 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {selectedPocket 
                      ? (POCKET_ICON_MAP[selectedPocket.icon] || <Wallet size={18} />)
                      : <Wallet size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-secondary dark:text-white truncate">
                        {selectedPocket ? selectedPocket.name : 'Kas Utama / Saldo Umum'}
                      </p>
                      {selectedPocket && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          selectedPocket.type === 'budget'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-primary/10 text-primary dark:bg-primary/25 dark:text-primary'
                        }`}>
                          {selectedPocket.type === 'budget' ? 'Pos Anggaran' : 'Pos Tabungan'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {selectedPocket 
                        ? `Saldo: ${formatAmount(selectedPocket.balance)}` 
                        : 'Arus kas umum tanpa memotong/menambah pocket'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isPocketDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                </div>
              </button>

              {/* Animated Custom Dropdown Menu */}
              <AnimatePresence>
                {isPocketDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="mt-2 w-full bg-white dark:bg-gray-800 border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-20"
                  >
                    <div className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-1">
                      {/* Option: Kas Utama */}
                      <button
                        type="button"
                        onClick={() => { setTxPocketId(''); setIsPocketDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          txPocketId === '' 
                            ? 'bg-primary/10 text-primary font-bold' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center">
                            <Wallet size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-secondary dark:text-white">Kas Utama / Saldo Umum</p>
                            <p className="text-[10px] text-gray-400 font-normal">Tanpa potongan pos anggaran/tabungan</p>
                          </div>
                        </div>
                        {txPocketId === '' && <Check size={16} className="text-primary mr-1" />}
                      </button>

                      {/* Group 1: Pos Anggaran */}
                      {budgetPockets.length > 0 && (
                        <div className="pt-2">
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Coffee size={12} className="text-amber-500" />
                            <span>Pos Anggaran (Budget)</span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            {budgetPockets.map(p => {
                              const isSelected = txPocketId === p.id;
                              const IconNode = POCKET_ICON_MAP[p.icon] || <Coffee size={16} />;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => { setTxPocketId(p.id); setIsPocketDropdownOpen(false); }}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                                    isSelected 
                                      ? 'bg-primary/10 text-primary font-bold' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-secondary dark:text-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                      {IconNode}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">
                                        Saldo: {formatAmount(p.balance)}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && <Check size={16} className="text-primary mr-1 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Group 2: Pos Tabungan */}
                      {savingPockets.length > 0 && (
                        <div className="pt-2">
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Shield size={12} className="text-primary" />
                            <span>Pos Tabungan (Saving)</span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            {savingPockets.map(p => {
                              const isSelected = txPocketId === p.id;
                              const IconNode = POCKET_ICON_MAP[p.icon] || <Shield size={16} />;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => { setTxPocketId(p.id); setIsPocketDropdownOpen(false); }}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                                    isSelected 
                                      ? 'bg-primary/10 text-primary font-bold' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-secondary dark:text-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                      {IconNode}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">
                                        Saldo: {formatAmount(p.balance)}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && <Check size={16} className="text-primary mr-1 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Live Balance Preview */}
              {selectedPocket && numericAmount > 0 && !isPocketDropdownOpen && (
                <div className="mt-2.5">
                  {txType === 'expense' ? (
                    numericAmount > selectedPocket.balance ? (
                      <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="font-bold">Saldo {selectedPocket.name} Tidak Mencukupi</p>
                          <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-300/80">
                            Saldo saat ini {formatAmount(selectedPocket.balance)}. Pengeluaran {formatAmount(numericAmount)} akan memotong saldo pocket hingga Rp 0.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 p-3 bg-primary/5 dark:bg-primary/15 border border-primary/20 dark:border-primary/40 rounded-xl text-xs text-secondary dark:text-gray-300">
                        <Wallet size={16} className="shrink-0 text-primary" />
                        <p className="text-[11px]">
                          Saldo <strong className="text-primary font-bold">{selectedPocket.name}</strong> ({formatAmount(selectedPocket.balance)}) dipotong {formatAmount(numericAmount)} &rarr; sisa <strong className="text-primary font-bold">{formatAmount(selectedPocket.balance - numericAmount)}</strong>
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                      <Wallet size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-[11px]">
                        Pemasukan dialokasikan ke <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{selectedPocket.name}</strong> &rarr; saldo menjadi <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{formatAmount(selectedPocket.balance + numericAmount)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Catatan / Keterangan</label>
              <input 
                type="text" 
                value={txNotes}
                onChange={(e) => setTxNotes(e.target.value)}
                placeholder="Mis. Makan siang, Bonus project, dll"
                className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-800/70 font-medium text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            <div className="pt-2 flex gap-4 shrink-0">
              <button 
                type="button"
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={!txAmount || !txCategory || isSubmitting}
                className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
