'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, PiggyBank, Shield, Target, Coins, Plane, Coffee, Heart, 
  ShoppingBag, Sparkles, Plus, ArrowUpRight, ArrowDownLeft, 
  MoreVertical, Edit2, Trash2, History, Check, AlertCircle, TrendingUp, Info, X,
  Search, Calendar, RotateCcw, ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, PocketMeta } from '@/context/UserContext';
import ConfirmModal from '@/components/ConfirmModal';

// Icon Map for Pocket
const POCKET_ICONS: Record<string, React.ReactNode> = {
  Wallet: <Wallet size={20} />,
  PiggyBank: <PiggyBank size={20} />,
  Shield: <Shield size={20} />,
  Target: <Target size={20} />,
  Coins: <Coins size={20} />,
  Plane: <Plane size={20} />,
  Coffee: <Coffee size={20} />,
  Heart: <Heart size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  Sparkles: <Sparkles size={20} />
};

// Color theme presets matching Ruang Edit Studio palette
const COLOR_PRESETS: Record<string, { bg: string; text: string; border: string; bar: string; badge: string }> = {
  purple: {
    bg: 'bg-[#F3EFFB] dark:bg-[#705994]/20',
    text: 'text-[#705994] dark:text-[#C5B3E6]',
    border: 'border-[#E3DAF3] dark:border-[#705994]/40',
    bar: 'bg-[#705994]',
    badge: 'bg-[#F3EFFB] text-[#705994] dark:bg-[#705994]/30 dark:text-[#E3DAF3]'
  },
  amber: {
    bg: 'bg-[#FEF6ED] dark:bg-[#F79E38]/20',
    text: 'text-[#F79E38] dark:text-[#FBC78D]',
    border: 'border-[#FDE5CB] dark:border-[#F79E38]/40',
    bar: 'bg-[#F79E38]',
    badge: 'bg-[#FEF6ED] text-[#E48B24] dark:bg-[#F79E38]/30 dark:text-[#FDE5CB]'
  },
  orange: {
    bg: 'bg-[#FEF6ED] dark:bg-[#F79E38]/20',
    text: 'text-[#F79E38] dark:text-[#FBC78D]',
    border: 'border-[#FDE5CB] dark:border-[#F79E38]/40',
    bar: 'bg-[#F79E38]',
    badge: 'bg-[#FEF6ED] text-[#E48B24] dark:bg-[#F79E38]/30 dark:text-[#FDE5CB]'
  },
  rose: {
    bg: 'bg-[#FFF0F4] dark:bg-[#FF5C7E]/20',
    text: 'text-[#FF5C7E] dark:text-[#FF94AC]',
    border: 'border-[#FED7E2] dark:border-[#FF5C7E]/40',
    bar: 'bg-[#FF5C7E]',
    badge: 'bg-[#FFF0F4] text-[#E03A5F] dark:bg-[#FF5C7E]/30 dark:text-[#FED7E2]'
  },
  blue: {
    bg: 'bg-[#EBFBF9] dark:bg-[#38C9BA]/20',
    text: 'text-[#1EA89A] dark:text-[#67E2D5]',
    border: 'border-[#CEF4EF] dark:border-[#38C9BA]/40',
    bar: 'bg-[#38C9BA]',
    badge: 'bg-[#EBFBF9] text-[#16857A] dark:bg-[#38C9BA]/30 dark:text-[#CEF4EF]'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900/40',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
};

export default function PocketPage() {
  const { pages, transactions, pockets, addPocket, updatePocket, deletePocket, allocatePocketFunds, transferPocketFunds, formatAmount, openTxModal } = useUser();
  const pageMeta = pages.find(p => p.id === 'pocket');

  // Filter Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'saving' | 'budget'>('all');

  // Modal States
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [editingPocket, setEditingPocket] = useState<PocketMeta | null>(null);

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundPocket, setFundPocket] = useState<PocketMeta | null>(null);
  const [fundAction, setFundAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [fundAmount, setFundAmount] = useState<string>('');
  const [fundNotes, setFundNotes] = useState<string>('');
  const [fundError, setFundError] = useState<string>('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyPocket, setHistoryPocket] = useState<PocketMeta | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Transfer / Bagi Dana Modal States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferError, setTransferError] = useState('');

  // Form States for Create/Edit Pocket
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'main' | 'saving' | 'budget'>('saving');
  const [formTarget, setFormTarget] = useState('');
  const [formInitialBalance, setFormInitialBalance] = useState('');
  const [formIcon, setFormIcon] = useState('Wallet');
  const [formColor, setFormColor] = useState('purple');
  const [formNotes, setFormNotes] = useState('');

  // History & Withdrawal Filter States
  const [historyFilterType, setHistoryFilterType] = useState<'withdraw' | 'all' | 'deposit'>('withdraw');
  const [historyFilterPocketId, setHistoryFilterPocketId] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');
  const [appliedStartDate, setAppliedStartDate] = useState<string>('');
  const [appliedEndDate, setAppliedEndDate] = useState<string>('');
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);

  // Persistent Filter Restoration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pocket_history_filter_active');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isFilterActive && (parsed.startDate || parsed.endDate)) {
          setHistoryStartDate(parsed.startDate || '');
          setHistoryEndDate(parsed.endDate || '');
          setAppliedStartDate(parsed.startDate || '');
          setAppliedEndDate(parsed.endDate || '');
          setIsDateFilterActive(true);
        }
      }
    } catch (e) {
      console.error('Failed to load pocket history filter:', e);
    }
  }, []);

  const handleApplyDateFilter = () => {
    if (!historyStartDate && !historyEndDate) {
      handleResetDateFilter();
      return;
    }
    setAppliedStartDate(historyStartDate);
    setAppliedEndDate(historyEndDate);
    setIsDateFilterActive(true);
    try {
      localStorage.setItem('pocket_history_filter_active', JSON.stringify({
        startDate: historyStartDate,
        endDate: historyEndDate,
        isFilterActive: true
      }));
    } catch (e) {
      console.error('Failed to save pocket history filter:', e);
    }
  };

  const handleResetDateFilter = () => {
    setHistoryStartDate('');
    setHistoryEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setIsDateFilterActive(false);
    try {
      localStorage.removeItem('pocket_history_filter_active');
    } catch (e) {
      console.error('Failed to clear pocket history filter:', e);
    }
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalCashFlow = totalIncome - totalExpense;

  const totalAllocated = useMemo(() => {
    return pockets.reduce((acc, p) => acc + (p.balance || 0), 0);
  }, [pockets]);

  const unallocatedCash = totalCashFlow - totalAllocated;

  // Main Pocket (Treasury)
  const mainPocket = useMemo(() => {
    return pockets.find(p => p.type === 'main' || p.id === 'pocket-utama') || pockets[0];
  }, [pockets]);

  // Filtered Sub Pockets
  const filteredPockets = useMemo(() => {
    const subPockets = pockets.filter(p => p.id !== mainPocket?.id);
    if (activeTab === 'all') return subPockets;
    return subPockets.filter(p => p.type === activeTab);
  }, [pockets, activeTab, mainPocket]);

  // Total in Sub Pockets (Budget & Savings)
  const totalSubPocketsAllocated = useMemo(() => {
    const subPockets = pockets.filter(p => p.id !== mainPocket?.id);
    return subPockets.reduce((acc, p) => acc + (p.balance || 0), 0);
  }, [pockets, mainPocket]);

  // Aggregated Mutations across all Pockets
  const allPocketMutations = useMemo(() => {
    const list: any[] = [];
    pockets.forEach(p => {
      (p.history || []).forEach(h => {
        list.push({
          ...h,
          pocketName: h.pocketName || p.name,
          pocketIcon: h.pocketIcon || p.icon,
          pocketColor: h.pocketColor || p.color
        });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pockets]);

  // Total Withdrawn Amount & Count
  const totalWithdrawnAmount = useMemo(() => {
    return allPocketMutations
      .filter(m => m.type === 'withdraw')
      .reduce((acc, m) => acc + (m.amount || 0), 0);
  }, [allPocketMutations]);

  const totalWithdrawalCount = useMemo(() => {
    return allPocketMutations.filter(m => m.type === 'withdraw').length;
  }, [allPocketMutations]);

  // Filtered History for the Section
  const filteredHistory = useMemo(() => {
    return allPocketMutations.filter(item => {
      if (historyFilterType !== 'all' && item.type !== historyFilterType) return false;
      if (historyFilterPocketId !== 'all' && item.pocketId !== historyFilterPocketId) return false;
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchNotes = item.notes?.toLowerCase().includes(q);
        const matchName = item.pocketName?.toLowerCase().includes(q);
        if (!matchNotes && !matchName) return false;
      }
      // Date filtering
      if (isDateFilterActive) {
        const itemDate = new Date(item.date);
        const year = itemDate.getFullYear();
        const month = String(itemDate.getMonth() + 1).padStart(2, '0');
        const day = String(itemDate.getDate()).padStart(2, '0');
        const itemDateStr = `${year}-${month}-${day}`;

        if (appliedStartDate && itemDateStr < appliedStartDate) return false;
        if (appliedEndDate && itemDateStr > appliedEndDate) return false;
      }
      return true;
    });
  }, [allPocketMutations, historyFilterType, historyFilterPocketId, historySearch, isDateFilterActive, appliedStartDate, appliedEndDate]);

  // Helper to format number input with thousand separator (00.000.000)
  const formatNumberInput = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric) return '';
    return parseInt(numeric, 10).toLocaleString('id-ID');
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPocket(null);
    setFormName('');
    setFormType('saving');
    setFormTarget('');
    setFormInitialBalance('');
    setFormIcon('Wallet');
    setFormColor('purple');
    setFormNotes('');
    setIsPocketModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (pocket: PocketMeta) => {
    setEditingPocket(pocket);
    setFormName(pocket.name);
    setFormType(pocket.type);
    setFormTarget(pocket.targetAmount ? pocket.targetAmount.toLocaleString('id-ID') : '');
    setFormInitialBalance('');
    setFormIcon(pocket.icon || 'Wallet');
    setFormColor(pocket.color || 'purple');
    setFormNotes(pocket.notes || '');
    setIsPocketModalOpen(true);
  };

  // Save Pocket (Create / Update)
  const handleSavePocket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const targetVal = formTarget ? parseFloat(formTarget.replace(/\D/g, '')) : undefined;

    if (editingPocket) {
      updatePocket(editingPocket.id, {
        name: formName.trim(),
        type: formType,
        targetAmount: targetVal,
        icon: formIcon,
        color: formColor,
        notes: formNotes.trim()
      });
    } else {
      const initialBal = formInitialBalance ? parseFloat(formInitialBalance.replace(/\D/g, '')) || 0 : 0;
      addPocket({
        name: formName.trim(),
        type: formType,
        balance: initialBal,
        targetAmount: targetVal,
        icon: formIcon,
        color: formColor,
        notes: formNotes.trim()
      });
    }
    setIsPocketModalOpen(false);
  };

  // Open Fund Modal (Deposit / Withdraw)
  const handleOpenFundModal = (pocket: PocketMeta, action: 'deposit' | 'withdraw') => {
    setFundPocket(pocket);
    setFundAction(action);
    setFundAmount('');
    setFundNotes('');
    setFundError('');
    setIsFundModalOpen(true);
  };

  // Submit Fund Transfer
  const handleSubmitFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundPocket) return;

    const amountNum = parseFloat(fundAmount.replace(/\D/g, ''));
    if (!amountNum || amountNum <= 0) {
      setFundError('Masukkan nominal yang valid');
      return;
    }

    const isMain = fundPocket.id === 'pocket-utama' || fundPocket.type === 'main';

    if (isMain) {
      if (fundAction === 'withdraw' && amountNum > (fundPocket.balance || 0)) {
        setFundError(`Saldo Pocket Utama tidak mencukupi (Maks: ${formatAmount(fundPocket.balance || 0)})`);
        return;
      }
      setIsFundModalOpen(false);
      openTxModal(fundAction === 'deposit' ? 'income' : 'expense', fundPocket.id);
      return;
    }

    if (fundAction === 'withdraw') {
      if (amountNum > (fundPocket.balance || 0)) {
        setFundError(`Saldo ${fundPocket.name} tidak mencukupi (Maks: ${formatAmount(fundPocket.balance || 0)})`);
        return;
      }
      transferPocketFunds(
        fundPocket.id, 
        mainPocket.id, 
        amountNum, 
        fundNotes.trim() || `Tarik saldo ${fundPocket.name} ke Pocket Utama`
      );
    } else {
      if (amountNum > (mainPocket?.balance || 0)) {
        setFundError(`Saldo Pocket Utama tidak mencukupi (Tersedia: ${formatAmount(mainPocket?.balance || 0)})`);
        return;
      }
      transferPocketFunds(
        mainPocket.id, 
        fundPocket.id, 
        amountNum, 
        fundNotes.trim() || `Isi saldo ${fundPocket.name} dari Pocket Utama`
      );
    }

    setIsFundModalOpen(false);
  };

  // Open Transfer / Bagi Dana Modal
  const handleOpenTransferModal = (sourcePocket?: PocketMeta) => {
    const fromId = sourcePocket ? sourcePocket.id : (mainPocket?.id || pockets[0]?.id || '');
    setTransferFromId(fromId);
    const defaultTarget = pockets.find(p => p.id !== fromId);
    setTransferToId(defaultTarget ? defaultTarget.id : '');
    setTransferAmount('');
    setTransferNotes('');
    setTransferError('');
    setIsTransferModalOpen(true);
  };

  // Submit Transfer / Bagi Dana
  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFromId || !transferToId) {
      setTransferError('Pilih pocket asal dan pocket tujuan');
      return;
    }
    if (transferFromId === transferToId) {
      setTransferError('Pocket asal dan tujuan tidak boleh sama');
      return;
    }
    const amountNum = parseFloat(transferAmount.replace(/\D/g, ''));
    if (!amountNum || amountNum <= 0) {
      setTransferError('Masukkan nominal transfer yang valid');
      return;
    }
    const sourcePocket = pockets.find(p => p.id === transferFromId);
    if (sourcePocket && amountNum > (sourcePocket.balance || 0)) {
      setTransferError(`Saldo ${sourcePocket.name} tidak mencukupi (Maks: ${formatAmount(sourcePocket.balance || 0)})`);
      return;
    }
    transferPocketFunds(transferFromId, transferToId, amountNum, transferNotes.trim());
    setIsTransferModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-secondary dark:text-white tracking-tight">
              {pageMeta?.name || 'Pocket'}
            </h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full dark:bg-primary/25 dark:text-purple-200">
              Pos Dana
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Pisahkan dan alokasikan saldo kas Anda ke berbagai kantong tabungan & anggaran terencana
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => handleOpenTransferModal(mainPocket)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-secondary dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary px-4 py-3 rounded-2xl font-bold transition-all shadow-xs active:scale-95 cursor-pointer text-sm"
          >
            <ArrowRightLeft size={16} className="text-primary" />
            <span>Bagi Dana</span>
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Buat Pocket Baru</span>
          </button>
        </div>
      </header>

      {/* Top Bento Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Cash Flow */}
        <div className="bento-card p-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Saldo Kas</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/25 text-primary flex items-center justify-center">
              <Coins size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-secondary dark:text-white">
              {formatAmount(totalCashFlow)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Total Pemasukan - Pengeluaran</p>
          </div>
        </div>

        {/* Saldo Pocket Utama */}
        <div className="bento-card p-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Pocket Utama</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-primary flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-primary dark:text-[#C5B3E6]">
              {formatAmount(mainPocket?.balance || 0)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Kas Induk Penghimpun Dana</p>
          </div>
        </div>

        {/* Pos Anggaran & Tabungan */}
        <div className="bento-card p-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pos Anggaran & Tabungan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatAmount(totalSubPocketsAllocated)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Terbagi di {filteredPockets.length} pos cabang
            </p>
          </div>
        </div>

        {/* Active Pockets Count */}
        <div className="bento-card p-5 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pos Pocket</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-primary flex items-center justify-center">
              <PiggyBank size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-secondary dark:text-white">
              {pockets.length} <span className="text-sm font-semibold text-gray-400">Kantong</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              1 Utama • {filteredPockets.filter(p => p.type === 'saving').length} Tabungan • {filteredPockets.filter(p => p.type === 'budget').length} Anggaran
            </p>
          </div>
        </div>
      </div>

      {/* Pocket Utama - Dedicated Main Treasury Showcase */}
      {mainPocket && (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#705994] via-[#5F4684] to-[#48336A] text-white p-6 sm:p-8 shadow-xl border border-white/10 mb-8 transition-all">
          {/* Subtle decorative circles */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider">
                  <Sparkles size={13} className="text-amber-300" />
                  Pocket Utama • Penghimpun Dana
                </span>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Kas Induk
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                {mainPocket.name}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-4">
                {mainPocket.notes || 'Penghimpun dana utama & kas induk untuk dialokasikan ke pocket lainnya.'}
              </p>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                  Saldo Kas Penghimpun Saat Ini
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatAmount(mainPocket.balance || 0)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick Actions for Pocket Utama */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleOpenTransferModal(mainPocket)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/95 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ArrowRightLeft size={16} />
                <span>Bagi Dana ke Pocket</span>
              </button>

              <button
                type="button"
                onClick={() => openTxModal('income', mainPocket.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-3.5 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Isi Kas</span>
              </button>

              <button
                type="button"
                onClick={() => openTxModal('expense', mainPocket.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3.5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
              >
                <ArrowDownLeft size={16} />
                <span>Tarik</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHistoryPocket(mainPocket);
                  setIsHistoryModalOpen(true);
                }}
                className="p-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-2xl transition-all cursor-pointer shrink-0"
                title="Riwayat Aliran Dana Pocket Utama"
              >
                <History size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'all' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
          >
            Semua Pocket ({filteredPockets.length})
          </button>
          <button
            onClick={() => setActiveTab('saving')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'saving' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
          >
            Tabungan & Goals ({filteredPockets.filter(p => p.type === 'saving').length})
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'budget' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
          >
            Pos Anggaran ({filteredPockets.filter(p => p.type === 'budget').length})
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <Info size={14} className="text-primary shrink-0" />
          <span>Klik <strong>+ Isi</strong> untuk memasukkan dana atau <strong>- Tarik</strong> untuk mencairkan</span>
        </div>
      </div>

      {/* Pockets Grid */}
      {pockets.length === 0 ? (
        <div className="bento-card py-20 flex flex-col items-center justify-center text-center px-4 bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-4">
            <Wallet size={32} />
          </div>
          <h3 className="text-lg font-bold text-secondary dark:text-white mb-1">Belum Ada Pocket</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            Mulai pisahkan dana Anda ke pos-pos keuangan seperti Dana Darurat, Tabungan Liburan, atau Biaya Bulanan.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Buat Pocket Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPockets.map((pocket) => {
            const themeStyle = COLOR_PRESETS[pocket.color] || COLOR_PRESETS.purple;
            const targetAmount = pocket.targetAmount || 0;
            const progress = targetAmount > 0 ? Math.min(100, Math.round((pocket.balance / targetAmount) * 100)) : null;

            return (
              <motion.div
                key={pocket.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bento-card relative bg-white dark:bg-gray-800/90 border ${themeStyle.border} rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md`}
              >
                {/* Top Row: Icon, Title, Actions */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${themeStyle.bg} ${themeStyle.text} flex items-center justify-center shadow-xs border ${themeStyle.border}`}>
                        {POCKET_ICONS[pocket.icon] || <Wallet size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary dark:text-white text-base leading-snug">
                          {pocket.name}
                        </h4>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${themeStyle.badge}`}>
                          {pocket.type === 'saving' ? 'Tabungan / Goal' : 'Pos Anggaran'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setHistoryPocket(pocket);
                          setIsHistoryModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                        title="Riwayat Mutasi"
                      >
                        <History size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(pocket)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                        title="Edit Pocket"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(pocket.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Pocket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {pocket.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-400 mb-4 line-clamp-2">
                      {pocket.notes}
                    </p>
                  )}

                  {/* Balance Display */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Saldo Saat Ini</span>
                    <h3 className="text-2xl font-black text-secondary dark:text-white tracking-tight mt-0.5">
                      {formatAmount(pocket.balance)}
                    </h3>
                  </div>

                  {/* Target Goal & Progress Bar */}
                  {targetAmount > 0 && progress !== null && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 mb-5">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className="text-gray-500 dark:text-gray-400">Target: {formatAmount(targetAmount)}</span>
                        <span className={themeStyle.text}>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${themeStyle.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="mt-1.5 text-[10px] text-gray-400 text-right">
                        {pocket.balance >= targetAmount ? (
                          <span className="text-green-600 dark:text-green-400 font-bold">🎉 Target tercapai!</span>
                        ) : (
                          <span>Kurang {formatAmount(targetAmount - pocket.balance)} lagi</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Actions */}
                <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFundModal(pocket, 'deposit')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white py-2.5 px-3 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Isi Saldo</span>
                  </button>
                  <button
                    onClick={() => handleOpenFundModal(pocket, 'withdraw')}
                    disabled={pocket.balance <= 0}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
                      pocket.balance > 0 
                        ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-secondary dark:text-white cursor-pointer active:scale-95' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    <span>Tarik Dana</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Riwayat Transaksi Penarikan Dana Pocket */}
      <div className="bento-card mt-8 p-6 md:p-8 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm">
        {/* Section Header & Filter Controls */}
        <div className="flex flex-col gap-4 mb-6 pb-5 border-b border-[var(--border)]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                <History size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-secondary dark:text-white tracking-tight">
                    Riwayat Transaksi Penarikan Dana
                  </h3>
                  {totalWithdrawalCount > 0 && (
                    <span className="bg-primary/10 text-primary text-[11px] font-extrabold px-2.5 py-0.5 rounded-full dark:bg-primary/25 dark:text-purple-200 border border-primary/20">
                      {totalWithdrawalCount} Kali Penarikan
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Total dana yang telah dicairkan: <strong className="text-accent font-bold">{formatAmount(totalWithdrawnAmount)}</strong> • Dana otomatis kembali ke saldo kas bebas Anda
                </p>
              </div>
            </div>

            {/* Filter Type Pills */}
            <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl text-xs font-bold border border-[var(--border)] self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setHistoryFilterType('withdraw')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  historyFilterType === 'withdraw'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-accent'
                }`}
              >
                <ArrowUpRight size={13} />
                <span>Penarikan Saja</span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  historyFilterType === 'all'
                    ? 'bg-secondary dark:bg-white text-white dark:text-secondary shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-secondary'
                }`}
              >
                Semua Mutasi
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilterType('deposit')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  historyFilterType === 'deposit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600'
                }`}
              >
                <ArrowDownLeft size={13} />
                <span>Alokasi Masuk</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Controls: Pocket, Search, & Date Range */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Filter by Pocket Dropdown */}
            <select
              value={historyFilterPocketId}
              onChange={(e) => setHistoryFilterPocketId(e.target.value)}
              className="bg-white dark:bg-gray-800 text-secondary dark:text-white text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
            >
              <option value="all">Semua Pocket ({pockets.length})</option>
              {pockets.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[140px] sm:w-44">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Cari catatan..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 text-secondary dark:text-white border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Date Filter: Dari, Sampai, Terapkan, Reset Filter */}
            <div className={`flex flex-wrap items-center gap-2 p-1.5 px-3 rounded-xl transition-all duration-300 ${
              isDateFilterActive 
                ? 'bg-primary/5 dark:bg-primary/20 ring-2 ring-primary shadow-primary/10' 
                : 'bg-gray-50 dark:bg-gray-900/60 border border-[var(--border)]'
            }`}>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                {isDateFilterActive ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                ) : (
                  <Calendar size={14} className="text-gray-400" />
                )}
                <span className="text-[11px] font-bold">Tanggal:</span>
              </div>

              {/* Dari */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-gray-400">Dari</span>
                <input 
                  type="date"
                  value={historyStartDate}
                  onChange={(e) => setHistoryStartDate(e.target.value)}
                  className="text-xs font-semibold bg-white dark:bg-gray-800 text-secondary dark:text-white border border-[var(--border)] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                />
              </div>

              {/* Sampai */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-gray-400">Sampai</span>
                <input 
                  type="date"
                  value={historyEndDate}
                  onChange={(e) => setHistoryEndDate(e.target.value)}
                  className="text-xs font-semibold bg-white dark:bg-gray-800 text-secondary dark:text-white border border-[var(--border)] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                />
              </div>

              {/* Terapkan Button */}
              <button 
                type="button"
                onClick={handleApplyDateFilter}
                className="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>Terapkan</span>
              </button>

              {/* Reset Filter Button */}
              {(isDateFilterActive || historyStartDate || historyEndDate) && (
                <button 
                  type="button"
                  onClick={handleResetDateFilter}
                  className="bg-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/40 dark:text-gray-300 dark:hover:text-red-400 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                  title="Reset filter tanggal"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* Active Date Filter Chip */}
            {isDateFilterActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary dark:bg-primary/25 dark:text-purple-200 rounded-full text-[11px] font-bold border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span>
                  {appliedStartDate ? new Date(appliedStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awal'} s/d {appliedEndDate ? new Date(appliedEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sekarang'}
                </span>
                <span className="text-accent font-extrabold">({filteredHistory.length} data)</span>
              </div>
            )}
          </div>
        </div>

        {/* History Content */}
        {filteredHistory.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-3">
              <History size={26} />
            </div>
            <h4 className="text-base font-bold text-secondary dark:text-white mb-1">
              {isDateFilterActive 
                ? 'Tidak Ada Transaksi Pada Periode Tanggal Tersebut'
                : historyFilterType === 'withdraw' 
                ? 'Belum Ada Transaksi Penarikan Dana' 
                : 'Belum Ada Mutasi Transaksi'}
            </h4>
            <p className="text-xs text-gray-400 max-w-md mb-5 leading-relaxed">
              {isDateFilterActive
                ? 'Tidak ditemukan catatan transaksi penarikan dana pada rentang tanggal yang dipilih. Anda dapat mengganti tanggal atau menekan tombol Reset Filter.'
                : historyFilterType === 'withdraw'
                ? 'Saat Anda mencairkan saldo dari salah satu pocket melalui tombol "Tarik Dana", riwayat penarikan beserta tanggal, catatan keperluan, dan nominalnya akan otomatis tercatat di sini.'
                : 'Belum ada catatan mutasi dana yang sesuai dengan filter yang Anda gunakan.'}
            </p>
            {isDateFilterActive && (
              <button
                type="button"
                onClick={handleResetDateFilter}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw size={14} />
                <span>Reset Filter Tanggal</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Pocket Asal</th>
                  <th className="py-3 px-4">Tipe Transaksi</th>
                  <th className="py-3 px-4">Catatan / Keperluan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Alur Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {filteredHistory.map((item) => {
                  const isWithdraw = item.type === 'withdraw';
                  const pTheme = COLOR_PRESETS[item.pocketColor || 'purple'] || COLOR_PRESETS.purple;

                  return (
                    <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      {/* Date & Time */}
                      <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        <p className="font-semibold text-secondary dark:text-white">
                          {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                      </td>

                      {/* Pocket Name */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${pTheme.bg} ${pTheme.text} flex items-center justify-center shrink-0 border ${pTheme.border}`}>
                            {POCKET_ICONS[item.pocketIcon || 'Wallet'] || <Wallet size={15} />}
                          </div>
                          <div>
                            <span className="font-bold text-secondary dark:text-white block">{item.pocketName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Mutation Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                          isWithdraw 
                            ? 'bg-accent/10 text-accent dark:bg-accent/20 border border-accent/25' 
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40'
                        }`}>
                          {isWithdraw ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {isWithdraw ? 'Penarikan Dana' : 'Alokasi Masuk'}
                        </span>
                      </td>

                      {/* Notes / Reason */}
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-xs">{item.notes || '-'}</span>
                      </td>

                      {/* Amount */}
                      <td className={`py-4 px-4 text-right font-black text-sm whitespace-nowrap ${
                        isWithdraw ? 'text-accent' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isWithdraw ? '-' : '+'}{formatAmount(item.amount)}
                      </td>

                      {/* Destination Flow */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
                          {isWithdraw ? 'Masuk ke Kas Bebas' : 'Dari Kas Bebas'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat / Edit Pocket */}
      {isPocketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-bold text-secondary dark:text-white">
                  {editingPocket ? 'Edit Pocket' : 'Buat Pocket Baru'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Atur pos alokasi dana sesuai rencana keuangan</p>
              </div>
              <button 
                onClick={() => setIsPocketModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePocket} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">NAMA POCKET</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Misal: Dana Darurat, Tabungan Liburan, Biaya Dapur"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">TIPE POCKET</label>
                {editingPocket?.type === 'main' ? (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs font-bold text-primary dark:text-[#C5B3E6] flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span>Pocket Utama (Penghimpun Dana & Kas Induk)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('saving')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        formType === 'saving'
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      🎯 Tabungan / Target
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('budget')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        formType === 'budget'
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      🛒 Pos Anggaran Bulanan
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">TARGET NOMINAL (OPSIONAL)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={formTarget}
                    onChange={(e) => setFormTarget(formatNumberInput(e.target.value))}
                    placeholder="Contoh: 5.000.000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                  />
                </div>
              </div>

              {!editingPocket && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">SALDO AWAL (OPSIONAL)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={formInitialBalance}
                      onChange={(e) => setFormInitialBalance(formatNumberInput(e.target.value))}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">PILIH IKON</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(POCKET_ICONS).map((iconKey) => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setFormIcon(iconKey)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        formIcon === iconKey
                          ? 'bg-primary text-white border-primary shadow-sm scale-105'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:text-primary'
                      }`}
                    >
                      {POCKET_ICONS[iconKey]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">WARNA TEMA KARTU</label>
                <div className="flex items-center gap-3">
                  {Object.keys(COLOR_PRESETS).map((cKey) => {
                    const preset = COLOR_PRESETS[cKey];
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setFormColor(cKey)}
                        className={`w-8 h-8 rounded-full ${preset.bar} flex items-center justify-center transition-all cursor-pointer ${
                          formColor === cKey ? 'ring-3 ring-offset-2 ring-primary scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {formColor === cKey && <Check size={14} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">CATATAN / TUJUAN</label>
                <textarea 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Keterangan singkat mengenai pos dana ini..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-xs"
                />
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsPocketModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-all shadow-md active:scale-95"
                >
                  {editingPocket ? 'Simpan Perubahan' : 'Buat Pocket'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Isi Saldo / Tarik Dana */}
      {isFundModalOpen && fundPocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[var(--border)]"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-secondary dark:text-white">
                  {fundAction === 'deposit' ? 'Isi Saldo Pocket' : 'Tarik Dana Pocket'}
                </h3>
                <p className="text-xs text-gray-400">{fundPocket.name}</p>
              </div>
              <button 
                onClick={() => setIsFundModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setFundAction('deposit'); setFundError(''); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  fundAction === 'deposit'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <ArrowDownLeft size={14} />
                <span>+ Isi Saldo</span>
              </button>
              <button
                type="button"
                onClick={() => { setFundAction('withdraw'); setFundError(''); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  fundAction === 'withdraw'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-500 hover:text-accent'
                }`}
              >
                <ArrowUpRight size={14} />
                <span>- Tarik Dana</span>
              </button>
            </div>

            <form onSubmit={handleSubmitFund} className="flex flex-col gap-4">
              {/* Pocket Balance Context */}
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-[var(--border)] flex justify-between items-center text-xs">
                <span className="text-gray-400">Saldo Pocket Ini:</span>
                <span className="font-bold text-secondary dark:text-white">{formatAmount(fundPocket.balance)}</span>
              </div>

              {fundAction === 'deposit' && (
                <div className="text-[11px] text-gray-400 flex justify-between">
                  <span>Sumber Dana (Pocket Utama):</span>
                  <span className={`font-semibold ${(mainPocket?.balance || 0) > 0 ? 'text-primary dark:text-[#C5B3E6]' : 'text-red-500'}`}>
                    {formatAmount(mainPocket?.balance || 0)}
                  </span>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">NOMINAL (RP)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={fundAmount}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setFundAmount(formatted);
                      setFundError('');
                    }}
                    placeholder="0"
                    autoFocus
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-base font-bold"
                  />
                </div>
                {fundError && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{fundError}</p>
                )}
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[50000, 100000, 250000, 500000, 1000000].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => {
                      setFundAmount(quickVal.toLocaleString('id-ID'));
                      setFundError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    +{(quickVal / 1000).toLocaleString('id-ID')}rb
                  </button>
                ))}
                {fundAction === 'deposit' && (mainPocket?.balance || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFundAmount((mainPocket?.balance || 0).toLocaleString('id-ID'));
                      setFundError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-primary dark:text-[#C5B3E6] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Semua Saldo Pocket Utama
                  </button>
                )}
                {fundAction === 'withdraw' && fundPocket.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFundAmount((fundPocket.balance || 0).toLocaleString('id-ID'));
                      setFundError('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-accent/15 dark:bg-accent/25 text-accent text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Tarik Semua
                  </button>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">CATATAN (OPSIONAL)</label>
                <input 
                  type="text" 
                  value={fundNotes}
                  onChange={(e) => setFundNotes(e.target.value)}
                  placeholder={fundAction === 'deposit' ? 'Contoh: Alokasi gaji bulanan' : 'Contoh: Keperluan darurat'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-xs"
                />
              </div>

              <div className="flex items-center gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-95 ${
                    fundAction === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-hover'
                  }`}
                >
                  {fundAction === 'deposit' ? 'Konfirmasi Isi Saldo' : 'Konfirmasi Tarik Dana'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Riwayat Mutasi Pocket */}
      {isHistoryModalOpen && historyPocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[var(--border)] max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-lg font-bold text-secondary dark:text-white">
                  Riwayat Mutasi: {historyPocket.name}
                </h3>
                <p className="text-xs text-gray-400">Saldo saat ini: {formatAmount(historyPocket.balance)}</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 divide-y divide-[var(--border)]">
              {(!historyPocket.history || historyPocket.history.length === 0) ? (
                <div className="py-12 text-center text-gray-400">
                  <History size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Belum ada riwayat mutasi untuk pocket ini.</p>
                </div>
              ) : (
                historyPocket.history.map((hist) => (
                  <div key={hist.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        hist.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-accent/15 text-accent dark:bg-accent/25'
                      }`}>
                        {hist.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-secondary dark:text-white">
                          {hist.type === 'deposit' ? 'Alokasi Masuk' : 'Penarikan'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(hist.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {hist.notes || '-'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${hist.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent'}`}>
                      {hist.type === 'deposit' ? '+' : '-'}{formatAmount(hist.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="mt-2 w-full py-2.5 rounded-xl font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            >
              Tutup
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal Transfer / Bagi Dana Pocket */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-[var(--border)] relative z-10"
          >
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary dark:text-white">
                    Bagi & Alokasikan Dana
                  </h3>
                  <p className="text-xs text-gray-400">Transfer saldo antar-pocket secara instan</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer} className="flex flex-col gap-4">
              {transferError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium border border-red-200 dark:border-red-900/40">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}

              {/* Source Pocket */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Dari Pocket (Sumber Dana)
                </label>
                <select
                  value={transferFromId}
                  onChange={(e) => {
                    setTransferFromId(e.target.value);
                    setTransferError('');
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {pockets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.type === 'main' ? '(⭐ Pocket Utama)' : ''} — Saldo: {formatAmount(p.balance || 0)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Pocket */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Ke Pocket Tujuan (Penerima Alokasi)
                </label>
                <select
                  value={transferToId}
                  onChange={(e) => {
                    setTransferToId(e.target.value);
                    setTransferError('');
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="" disabled>Pilih Pocket Tujuan...</option>
                  {pockets.filter(p => p.id !== transferFromId).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.type === 'main' ? '(⭐ Pocket Utama)' : `(${p.type === 'budget' ? 'Pos Anggaran' : 'Pos Tabungan'})`} — Saldo: {formatAmount(p.balance || 0)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nominal Transfer (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={transferAmount}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setTransferAmount(formatted);
                      setTransferError('');
                    }}
                    placeholder="0"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-base font-bold"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[100000, 250000, 500000, 1000000, 2000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTransferAmount(val.toLocaleString('id-ID'))}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      {val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000} rb`}
                    </button>
                  ))}
                  {(() => {
                    const src = pockets.find(p => p.id === transferFromId);
                    if (src && src.balance > 0) {
                      return (
                        <button
                          type="button"
                          onClick={() => setTransferAmount((src.balance || 0).toLocaleString('id-ID'))}
                          className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer"
                        >
                          Semua Saldo
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Catatan Alokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Contoh: Alokasi gaji bulanan, jatah belanja dll"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft size={14} />
                  <span>Konfirmasi Bagi Dana</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Hapus Pocket */}
      <ConfirmModal 
        isOpen={deleteConfirmId !== null}
        title="Hapus Pos Pocket"
        message="Apakah Anda yakin ingin menghapus pocket ini? Saldo yang tersisa di pocket ini akan otomatis dikembalikan ke saldo kas bebas Anda."
        confirmText="Ya, Hapus Pocket"
        cancelText="Batal"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deletePocket(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        isDestructive={true}
      />
    </div>
  );
}
