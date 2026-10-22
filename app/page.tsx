'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Plus, X, Briefcase, ShoppingCart, Coffee, Lightbulb, Filter, Eye, EyeOff, Activity, ArrowUpRight, ArrowDownRight, Sparkles, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ComposedChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '@/context/UserContext';
import { AVAILABLE_ICONS } from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';

const getCategoryIcon = (categoryName: string, categories: any[]) => {
  const cat = categories.find(c => c.name === categoryName);
  if (cat && AVAILABLE_ICONS[cat.icon]) {
    return React.cloneElement(AVAILABLE_ICONS[cat.icon] as React.ReactElement, { size: 16 });
  }
  return <Briefcase size={16} />;
};

export default function LandingPage() {
  const { pages, dashboardLabels, categories, transactions, setTransactions, formatAmount, isBalanceHidden, toggleBalanceVisibility, openTxModal } = useUser();
  const pageMeta = pages.find(p => p.id === 'dashboard');

  const [isMounted, setIsMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('dashboard_filter_active');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isFilterActive && (parsed.startDate || parsed.endDate)) {
          setStartDate(parsed.startDate || '');
          setEndDate(parsed.endDate || '');
          setAppliedStartDate(parsed.startDate || '');
          setAppliedEndDate(parsed.endDate || '');
          setIsFilterApplied(true);
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard filter:', e);
    }
  }, []);

  const currentMonthStr = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const [pnlRange, setPnlRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [pnlViewMode, setPnlViewMode] = useState<'net' | 'all'>('net');

  const handleApplyFilter = () => {
    if (!startDate && !endDate) {
      handleResetFilter();
      return;
    }
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setIsFilterApplied(true);
    try {
      localStorage.setItem('dashboard_filter_active', JSON.stringify({
        startDate,
        endDate,
        isFilterActive: true
      }));
    } catch (e) {
      console.error('Failed to save dashboard filter:', e);
    }
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setIsFilterApplied(false);
    try {
      localStorage.removeItem('dashboard_filter_active');
    } catch (e) {
      console.error('Failed to clear dashboard filter:', e);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (isFilterApplied) {
      if (appliedStartDate && t.date < appliedStartDate) return false;
      if (appliedEndDate && t.date > appliedEndDate) return false;
    }
    return true;
  });

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0));
  const balance = income - expense;

  const recent = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Format for YAxis compact currency labels
  const formatYAxis = (val: number) => {
    if (val === 0) return '0';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 1_000_000_000) return `${sign}Rp${(abs / 1_000_000_000).toFixed(1)}M`;
    if (abs >= 1_000_000) return `${sign}Rp${(abs / 1_000_000).toFixed(1)}jt`;
    if (abs >= 1_000) return `${sign}Rp${Math.round(abs / 1_000)}rb`;
    return `${sign}Rp${abs}`;
  };

  // Dynamic P&L Trend Calculation
  const daysCount = pnlRange === '7d' ? 7 : pnlRange === '14d' ? 14 : 30;
  const baseDate = (isFilterApplied && appliedEndDate) ? new Date(appliedEndDate) : new Date();

  const pnlTrendData = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const fullDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });

    let dayIncome = 0;
    let dayExpense = 0;

    filteredTransactions.forEach(t => {
      if (t.date === dateStr) {
        if (t.type === 'income') dayIncome += Math.abs(t.amount);
        if (t.type === 'expense') dayExpense += Math.abs(t.amount);
      }
    });

    const netProfit = dayIncome - dayExpense;

    pnlTrendData.push({
      dateStr,
      displayDate,
      fullDate,
      income: dayIncome,
      expense: dayExpense,
      netProfit,
    });
  }

  const totalTrendIncome = pnlTrendData.reduce((acc, curr) => acc + curr.income, 0);
  const totalTrendExpense = pnlTrendData.reduce((acc, curr) => acc + curr.expense, 0);
  const totalTrendNetProfit = totalTrendIncome - totalTrendExpense;
  const trendProfitMargin = totalTrendIncome > 0
    ? Math.round((totalTrendNetProfit / totalTrendIncome) * 100)
    : (totalTrendExpense > 0 ? -100 : 0);
  const avgDailyTrendProfit = Math.round(totalTrendNetProfit / daysCount);

  let bestDay = pnlTrendData[0];
  let profitDaysCount = 0;
  let lossDaysCount = 0;

  pnlTrendData.forEach(d => {
    if (d.netProfit > (bestDay?.netProfit ?? -Infinity)) bestDay = d;
    if (d.netProfit > 0) profitDaysCount++;
    if (d.netProfit < 0) lossDaysCount++;
  });

  const CustomPnlTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProfit = data.netProfit >= 0;
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 min-w-[210px] text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/80 pb-2 mb-2">
            <span className="font-bold text-gray-700 dark:text-gray-200">{data.fullDate || data.displayDate}</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
              data.netProfit === 0
                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                : isProfit
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
            }`}>
              {data.netProfit === 0 ? 'Impas' : isProfit ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Pemasukan:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(data.income)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Pengeluaran:
              </span>
              <span className="font-bold text-primary">{formatAmount(data.expense)}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/80 flex justify-between items-center text-sm font-bold">
              <span className="text-secondary dark:text-white">Laba/Rugi Bersih:</span>
              <span className={data.netProfit === 0 ? 'text-gray-500' : isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {data.netProfit > 0 ? '+' : ''}{formatAmount(data.netProfit)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Dynamic Analytics Data (Line Chart - Last 7 Days)
  const analyticsDataMap: Record<string, {displayDate: string, pengeluaran: number, pemasukan: number}> = {};
  const analyticsBase = (isFilterApplied && appliedEndDate) ? new Date(appliedEndDate) : new Date();
  for(let i=6; i>=0; i--) {
     const d = new Date(analyticsBase);
     d.setDate(analyticsBase.getDate() - i);
     const dateStr = d.toISOString().split('T')[0];
     const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
     analyticsDataMap[dateStr] = { displayDate, pengeluaran: 0, pemasukan: 0 };
  }

  filteredTransactions.forEach(t => {
    if (analyticsDataMap[t.date]) {
       if (t.type === 'expense') analyticsDataMap[t.date].pengeluaran += Math.abs(t.amount);
       if (t.type === 'income') analyticsDataMap[t.date].pemasukan += Math.abs(t.amount);
    }
  });

  const analyticsData = Object.values(analyticsDataMap).map(d => ({
    date: d.displayDate,
    pengeluaran: d.pengeluaran,
    pemasukan: d.pemasukan
  }));

  // Framer Motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Top Nav / Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4"
      >
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-secondary tracking-tight">{pageMeta?.name || 'Dashboard'}</h1>
            <p className="text-gray-500">Welcome back to Rumah kita</p>
          </div>
          {/* Mobile Eye Button right by the title */}
          <button 
            onClick={toggleBalanceVisibility}
            className="lg:hidden flex items-center justify-center p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-primary rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 transition-all shrink-0"
            title="Sembunyikan Saldo"
          >
            {isBalanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* Global Date Filter */}
          <div className={`flex flex-wrap items-center gap-2.5 p-2 rounded-2xl shadow-sm transition-all duration-300 w-full sm:w-auto ${
            isFilterApplied 
              ? 'bg-primary/5 dark:bg-primary/15 ring-2 ring-primary shadow-primary/10' 
              : 'bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700'
          }`}>
            <div className="flex items-center gap-2 pl-2">
              {isFilterApplied ? (
                <span className="relative flex h-3 w-3" title="Filter Aktif">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              ) : (
                <Filter size={16} className="text-gray-400" />
              )}
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-none rounded-lg px-2 py-1.5 text-sm font-medium bg-gray-50 dark:bg-gray-900 outline-none focus:ring-primary text-secondary dark:text-gray-300 transition-colors"
            />
            <span className="text-gray-400 text-xs font-medium">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-none rounded-lg px-2 py-1.5 text-sm font-medium bg-gray-50 dark:bg-gray-900 outline-none focus:ring-primary text-secondary dark:text-gray-300 transition-colors"
            />
            <button 
              onClick={handleApplyFilter}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>Terapkan</span>
            </button>
            {(isFilterApplied || startDate || endDate) && (
              <button 
                onClick={handleResetFilter}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 dark:bg-gray-700 dark:hover:bg-red-950/40 dark:text-gray-300 dark:hover:text-red-400 px-3 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                title="Reset filter dan tampilkan seluruh data"
              >
                <RotateCcw size={14} />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Desktop Eye Button */}
          <button 
            onClick={toggleBalanceVisibility}
            className="hidden lg:flex items-center justify-center p-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-primary rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 transition-all shrink-0"
            title="Sembunyikan Saldo"
          >
            {isBalanceHidden ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          {/* Desktop Input Transaksi Button */}
          <button 
            onClick={openTxModal}
            className="hidden md:flex items-center gap-2 bg-secondary hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Input Transaksi</span>
          </button>
        </div>
      </motion.div>

      {/* Active Filter Notification Banner */}
      {isFilterApplied && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 px-4 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/40 rounded-2xl text-xs"
        >
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span>
              Filter Dashboard Aktif: {appliedStartDate ? new Date(appliedStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awal Transaksi'} s/d {appliedEndDate ? new Date(appliedEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari Ini'}
            </span>
          </div>
          <button 
            onClick={handleResetFilter}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold hover:underline ml-auto"
          >
            <RotateCcw size={12} />
            <span>Reset Filter</span>
          </button>
        </motion.div>
      )}

      {/* Bento Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 flex-1 pb-8 content-start"
      >
        
        {/* Total Balance Card */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-2 lg:col-span-2 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2.5 bg-primary/10 dark:bg-primary/25 rounded-xl text-primary"><Wallet size={20} /></div>
                <span className="font-semibold text-lg">{dashboardLabels.totalBalance}</span>
              </div>
              {balance <= 500000 ? (
                <div className="flex items-center gap-2 text-sm text-red-600 font-bold bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full animate-pulse shadow-sm ring-1 ring-red-100 dark:ring-red-900/40">
                  <TrendingDown size={16} />
                  <span>Lebih Hemat!</span>
                </div>
              ) : balance > 2000000 && new Date().getDate() >= 25 ? (
                <div className="flex items-center gap-2 text-sm text-accent font-bold bg-accent/10 dark:bg-accent/20 px-3 py-1 rounded-full animate-pulse shadow-sm ring-1 ring-accent/25">
                  <Wallet size={16} />
                  <span>Yuk Menabung!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/40 px-3 py-1 rounded-full">
                  <TrendingUp size={16} />
                  <span>+12%</span>
                </div>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-secondary mt-6 tracking-tight">
              {formatAmount(balance)}
            </h2>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div variants={item} className="bento-card p-6 flex flex-col justify-between bg-emerald-500/5 dark:bg-emerald-950/20 min-h-[160px]">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400"><TrendingUp size={20} /></div>
            <span className="font-semibold">{dashboardLabels.income}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary">{formatAmount(income)}</h3>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">Bulan {currentMonthStr}</p>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div variants={item} className="bento-card p-6 flex flex-col justify-between bg-accent/5 dark:bg-accent/15 min-h-[160px]">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-4">
            <div className="p-2 bg-accent/15 dark:bg-accent/25 rounded-xl text-accent"><TrendingDown size={20} /></div>
            <span className="font-semibold">{dashboardLabels.expense}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary">{formatAmount(expense)}</h3>
            <p className="text-sm font-medium text-accent mt-1">Bulan {currentMonthStr}</p>
          </div>
        </motion.div>

        {/* Profit and Loss Trend Card */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-3 lg:col-span-3 p-6 flex flex-col justify-between">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-secondary dark:text-white">{dashboardLabels.profitAndLoss}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/25 dark:text-purple-200">
                  Tren Laba/Rugi
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Evaluasi performa surplus vs defisit harian & profit margin
              </p>
            </div>

            {/* Timeframe & Mode Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPnlViewMode('net')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    pnlViewMode === 'net'
                      ? 'bg-white dark:bg-gray-700 text-secondary dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-secondary dark:text-gray-400'
                  }`}
                >
                  Tren Laba
                </button>
                <button
                  onClick={() => setPnlViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    pnlViewMode === 'all'
                      ? 'bg-white dark:bg-gray-700 text-secondary dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-secondary dark:text-gray-400'
                  }`}
                >
                  Detail Arus
                </button>
              </div>

              {/* Range Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
                {(['7d', '14d', '30d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setPnlRange(range)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      pnlRange === range
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-500 hover:text-secondary dark:text-gray-400'
                    }`}
                  >
                    {range === '7d' ? '7 Hari' : range === '14d' ? '14 Hari' : '30 Hari'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 mb-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Laba Bersih ({pnlRange === '7d' ? '7H' : pnlRange === '14d' ? '14H' : '30H'})
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-base sm:text-lg font-extrabold ${totalTrendNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalTrendNetProfit > 0 ? '+' : ''}{formatAmount(totalTrendNetProfit)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status Tren</p>
              <div className="flex items-center gap-1.5 mt-1">
                {totalTrendNetProfit > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <TrendingUp size={13} />
                    Surplus ({trendProfitMargin}%)
                  </span>
                ) : totalTrendNetProfit < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    <TrendingDown size={13} />
                    Defisit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Impas (0)
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rata-rata Harian</p>
              <p className={`text-xs sm:text-sm font-bold mt-1 ${avgDailyTrendProfit >= 0 ? 'text-secondary dark:text-white' : 'text-red-500'}`}>
                {avgDailyTrendProfit > 0 ? '+' : ''}{formatAmount(avgDailyTrendProfit)}/hr
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hari Terbaik</p>
              <p className="text-xs sm:text-sm font-bold mt-1 text-secondary dark:text-white truncate">
                {bestDay && bestDay.netProfit > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {bestDay.displayDate} (+{formatAmount(bestDay.netProfit)})
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </p>
            </div>
          </div>

          {/* Trend Chart (Recharts ComposedChart) */}
          <div className="w-full h-[230px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pnlTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="pnlLossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" className="dark:stroke-gray-800" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} 
                  dy={8} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} 
                  tickFormatter={formatYAxis} 
                />
                <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip content={<CustomPnlTooltip />} />
                
                {/* Net Profit Area Curve */}
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  name="Laba/Rugi Bersih" 
                  stroke={totalTrendNetProfit >= 0 ? '#10B981' : '#EF4444'} 
                  strokeWidth={2.5} 
                  fill={totalTrendNetProfit >= 0 ? 'url(#pnlProfitGradient)' : 'url(#pnlLossGradient)'} 
                  dot={{ r: 3, fill: totalTrendNetProfit >= 0 ? '#10B981' : '#EF4444', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: totalTrendNetProfit >= 0 ? '#10B981' : '#EF4444', stroke: '#fff', strokeWidth: 2 }}
                />

                {/* Optional Breakdown: Pemasukan & Pengeluaran Lines */}
                {pnlViewMode === 'all' && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name="Pemasukan" 
                      stroke="#22C55E" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      name="Pengeluaran" 
                      stroke="#F79E38" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Insights Strip */}
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${profitDaysCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <span>
                {profitDaysCount > 0 
                  ? `${profitDaysCount} dari ${daysCount} hari dalam tren surplus positif.` 
                  : 'Belum ada hari dengan laba surplus pada rentang ini.'}
              </span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">Total Masuk: {formatAmount(totalTrendIncome)}</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-accent">Total Keluar: {formatAmount(totalTrendExpense)}</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-3 lg:col-span-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-secondary">{dashboardLabels.recent}</h3>
            <Link href="/transactions" className="text-primary p-1.5 hover:bg-primary/10 rounded-lg transition-colors font-semibold text-sm flex items-center gap-1 cursor-pointer">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center overflow-y-auto">
            {recent.map((item, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer p-2 hover:bg-primary/5 dark:hover:bg-primary/15 rounded-xl transition-all -mx-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-accent/15 text-accent dark:bg-accent/25'}`}>
                    {getCategoryIcon(item.category, categories)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-secondary group-hover:text-primary transition-colors">{item.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-gray-400">{item.date}</span>
                      {item.notes && item.notes.includes('[Pocket:') && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded-md">
                          🏷️ {item.notes.match(/\[Pocket:\s*([^\]]+)\]/)?.[1]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-500' : 'text-accent'}`}>
                  {item.amount > 0 ? '+' : ''}{formatAmount(Math.abs(item.amount))}
                </span>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="text-center text-sm font-medium text-gray-400 mt-4">
                No recent transactions
              </div>
            )}
          </div>
        </motion.div>

        {/* Detailed Analytics Chart (Recharts) */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-3 lg:col-span-4 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-secondary">{dashboardLabels.analytics}</h3>
          </div>

          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F79E38" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F79E38" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE7DE" className="dark:stroke-gray-800" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatAmount(value), '']}
                />
                <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorPemasukan)" />
                <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#F79E38" strokeWidth={3} fillOpacity={1} fill="url(#colorPengeluaran)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
      </motion.div>
    </>
  );
}
