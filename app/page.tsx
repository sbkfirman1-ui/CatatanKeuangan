'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Plus, X, Briefcase, ShoppingCart, Coffee, Lightbulb, Filter, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const { pages, dashboardLabels, categories, transactions, setTransactions, formatAmount, isBalanceHidden, toggleBalanceVisibility } = useUser();
  const pageMeta = pages.find(p => p.id === 'dashboard');

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const currentMonthStr = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApplyFilter = () => {
    // The filter applies instantly via filteredTransactions below,
    // but the button can just be used to confirm state visually.
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0));
  const balance = income - expense;

  const recent = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleSaveTransaction = async () => {
    if (!txAmount || !txCategory) return;
    const numericAmount = parseInt(txAmount.replace(/\D/g, ''), 10);
    const newTx = {
      id: Date.now(),
      name: txNotes || txCategory,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
      amount: txType === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount),
      type: txType,
      notes: txNotes
    };

    const { data, error } = await supabase.from('transactions').insert([newTx]).select();
    
    if (!error && data) {
      setTransactions([data[0], ...transactions]);
    }

    setTxAmount('');
    setTxNotes('');
    setTxCategory('');
    setIsModalOpen(false);
  };

  // Dynamic Chart Data (P&L Bar Chart)
  const chartDataMap: Record<string, {expense: number, income: number}> = {
    'Mon': {expense:0, income:0}, 'Tue': {expense:0, income:0}, 'Wed': {expense:0, income:0}, 
    'Thu': {expense:0, income:0}, 'Fri': {expense:0, income:0}, 'Sat': {expense:0, income:0}, 'Sun': {expense:0, income:0}
  };
  
  filteredTransactions.forEach(t => {
    const d = new Date(t.date);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (chartDataMap[day]) {
      if (t.type === 'expense') chartDataMap[day].expense += Math.abs(t.amount);
      if (t.type === 'income') chartDataMap[day].income += Math.abs(t.amount);
    }
  });

  let maxAmount = 0;
  Object.values(chartDataMap).forEach(d => {
    if (d.expense > maxAmount) maxAmount = d.expense;
    if (d.income > maxAmount) maxAmount = d.income;
  });

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
    const d = chartDataMap[day];
    return {
      day,
      expenseRaw: d.expense,
      incomeRaw: d.income,
      expense: maxAmount === 0 ? 0 : Math.round((d.expense / maxAmount) * 100),
      income: maxAmount === 0 ? 0 : Math.round((d.income / maxAmount) * 100),
    };
  });

  // Dynamic Analytics Data (Line Chart - Last 7 Days)
  const analyticsDataMap: Record<string, {displayDate: string, pengeluaran: number, pemasukan: number}> = {};
  for(let i=6; i>=0; i--) {
     const d = new Date();
     d.setDate(d.getDate() - i);
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
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">{pageMeta?.name || 'Dashboard'}</h1>
          <p className="text-gray-500">Welcome back to Rumah kita</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* Global Date Filter */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 transition-colors">
            <div className="flex items-center gap-2 pl-2">
              <Filter size={16} className="text-gray-400" />
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
              className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Terapkan
            </button>
          </div>

          <button 
            onClick={toggleBalanceVisibility}
            className="flex items-center justify-center p-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-primary rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 transition-all shrink-0"
            title="Sembunyikan Saldo"
          >
            {isBalanceHidden ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-secondary hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Input Transaksi</span>
          </button>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 flex-1 pb-8 content-start"
      >
        
        {/* Total Balance Card */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-2 lg:col-span-2 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2.5 bg-orange-100 rounded-xl text-primary"><Wallet size={20} /></div>
                <span className="font-semibold text-lg">{dashboardLabels.totalBalance}</span>
              </div>
              {balance <= 500000 ? (
                <div className="flex items-center gap-2 text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full animate-pulse shadow-sm ring-1 ring-red-100">
                  <TrendingDown size={16} />
                  <span>Lebih Hemat!</span>
                </div>
              ) : balance > 2000000 && new Date().getDate() >= 25 ? (
                <div className="flex items-center gap-2 text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full animate-pulse shadow-sm ring-1 ring-blue-100">
                  <Wallet size={16} />
                  <span>Yuk Menabung!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
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
        <motion.div variants={item} className="bento-card p-6 flex flex-col justify-between bg-green-50/30 min-h-[160px]">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <div className="p-2 bg-green-100 rounded-xl text-green-600"><TrendingUp size={20} /></div>
            <span className="font-semibold">{dashboardLabels.income}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary">{formatAmount(income)}</h3>
            <p className="text-sm font-medium text-green-500 mt-1">Bulan {currentMonthStr}</p>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div variants={item} className="bento-card p-6 flex flex-col justify-between bg-orange-50/30 min-h-[160px]">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <div className="p-2 bg-orange-100 rounded-xl text-primary"><TrendingDown size={20} /></div>
            <span className="font-semibold">{dashboardLabels.expense}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary">{formatAmount(expense)}</h3>
            <p className="text-sm font-medium text-primary mt-1">Bulan {currentMonthStr}</p>
          </div>
        </motion.div>

        {/* CSS Cash Flow Area */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-3 lg:col-span-3 p-6 min-h-[320px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-secondary">{dashboardLabels.profitAndLoss}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                <div className="w-3 h-3 rounded-sm bg-primary" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)' }}></div>
                Pemasukan
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                <div className="w-3 h-3 rounded-sm bg-secondary"></div>
                Pengeluaran
              </div>
            </div>
          </div>
          
          {/* Chart Bars */}
          <div className="flex-1 flex items-end justify-between gap-3 mt-2 px-2 relative">
            {chartData.map((data, i) => (
              <div key={i} className="w-full max-w-[60px] h-full flex flex-col justify-end gap-[2px] group cursor-pointer">
                {/* Income Bar (Orange Striped) - On Top */}
                <div 
                  className="w-full bg-primary rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-sm" 
                  style={{ 
                    height: `${data.income}%`, 
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)' 
                  }}
                  title={`Income: ${formatAmount(data.incomeRaw)}`}
                ></div>
                {/* Expense Bar (Black Solid) - On Bottom */}
                <div 
                  className="w-full bg-secondary rounded-b-lg transition-all duration-300 group-hover:brightness-125 shadow-sm" 
                  style={{ height: `${data.expense}%` }}
                  title={`Expense: ${formatAmount(data.expenseRaw)}`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm font-bold text-gray-400 px-4">
            {chartData.map((d, i) => <span key={i}>{d.day}</span>)}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-3 lg:col-span-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-secondary">{dashboardLabels.recent}</h3>
            <Link href="/transactions" className="text-primary p-1.5 hover:bg-orange-50 rounded-lg transition-colors font-semibold text-sm flex items-center gap-1 cursor-pointer">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center overflow-y-auto">
            {recent.map((item, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all -mx-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${item.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                    {getCategoryIcon(item.category, categories)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-secondary group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs font-medium text-gray-400">{item.date}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${item.type === 'income' ? 'text-green-500' : 'text-orange-500'}`}>
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
                    <stop offset="5%" stopColor="#FF5722" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF5722" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatAmount(value), '']}
                />
                <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorPemasukan)" />
                <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#FF5722" strokeWidth={3} fillOpacity={1} fill="url(#colorPengeluaran)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
      </motion.div>

      {/* Input Transaksi Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-secondary">Input Transaksi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-secondary hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              {/* Type Toggle */}
              <div className="flex bg-gray-100 p-1.5 rounded-xl">
                <button 
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${txType === 'expense' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-secondary'}`}
                >
                  Pengeluaran
                </button>
                <button 
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${txType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-secondary'}`}
                >
                  Pemasukan
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Nominal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                  <input 
                    type="text"
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
                    className="w-full border-none rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 font-bold text-xl text-secondary outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Kategori</label>
                <select 
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 font-medium text-secondary outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Pilih Kategori...</option>
                  {categories.filter(c => c.type === txType).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Catatan / Keterangan</label>
                <input 
                  type="text" 
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Mis. Makan siang"
                  className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 font-medium text-secondary outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveTransaction}
                disabled={!txAmount || !txCategory}
                className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Transaksi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
