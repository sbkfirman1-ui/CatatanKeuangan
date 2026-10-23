'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search, Briefcase, Download, Trash2, RotateCcw, X, ArrowUpRight, ArrowDownLeft, Tag, Calendar as CalendarIcon, SlidersHorizontal } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import ConfirmModal from '@/components/ConfirmModal';
import { AVAILABLE_ICONS } from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';

const getCategoryIcon = (categoryName: string, categories: any[]) => {
  const cat = categories.find(c => c.name === categoryName);
  if (cat && AVAILABLE_ICONS[cat.icon]) {
    return React.cloneElement(AVAILABLE_ICONS[cat.icon] as React.ReactElement, { size: 16 });
  }
  return <Briefcase size={16} />;
};

export default function TransactionsPage() {
  const { pages, transactions, categories, setTransactions, formatAmount, resetAllPockets } = useUser();
  const pageMeta = pages.find(p => p.id === 'transactions');

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Persistent Filter Restoration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('transactions_filter_active');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.startDate) setStartDate(parsed.startDate);
          if (parsed.endDate) setEndDate(parsed.endDate);
          if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
          if (parsed.selectedType) setSelectedType(parsed.selectedType);
          if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        }
      }
    } catch (e) {
      console.error('Failed to load transactions filter:', e);
    }
  }, []);

  // Save filter to localStorage on change
  useEffect(() => {
    try {
      if (startDate || endDate || searchQuery.trim() || selectedType !== 'all' || selectedCategory !== 'all') {
        localStorage.setItem('transactions_filter_active', JSON.stringify({
          startDate,
          endDate,
          searchQuery,
          selectedType,
          selectedCategory
        }));
      } else {
        localStorage.removeItem('transactions_filter_active');
      }
    } catch (e) {
      console.error('Failed to save transactions filter:', e);
    }
  }, [startDate, endDate, searchQuery, selectedType, selectedCategory]);

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Date filtering
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Type filtering
      if (selectedType !== 'all' && t.type !== selectedType) return false;

      // Category filtering
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Search query filtering (by name or notes)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = t.name?.toLowerCase().includes(query);
        const matchNotes = t.notes?.toLowerCase().includes(query);
        const matchCategory = t.category?.toLowerCase().includes(query);
        if (!matchName && !matchNotes && !matchCategory) return false;
      }

      return true;
    });
  }, [transactions, startDate, endDate, selectedType, selectedCategory, searchQuery]);

  // Is any filter currently applied?
  const isFilterActive = Boolean(
    startDate || 
    endDate || 
    searchQuery.trim() || 
    selectedType !== 'all' || 
    selectedCategory !== 'all'
  );

  const activeFilterCount = [
    Boolean(startDate || endDate),
    selectedType !== 'all',
    selectedCategory !== 'all',
    Boolean(searchQuery.trim())
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    try {
      localStorage.removeItem('transactions_filter_active');
    } catch (e) {
      console.error('Failed to clear transactions filter:', e);
    }
  };

  const handleExportCSV = () => {
    const listToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount', 'Notes'];
    const rows = listToExport.map(t => [
      t.date,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  // Quick summary for current filtered view
  const filteredIncome = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [filteredTransactions]);

  const filteredExpense = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col h-full pb-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary dark:text-white tracking-tight">{pageMeta?.name || 'Transactions'}</h1>
          <p className="text-gray-500 dark:text-gray-400">Pantau dan kelola seluruh riwayat transaksi keuangan Anda</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-secondary dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            title="Download CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button 
            onClick={handleResetData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            title="Hapus Semua Transaksi"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Hapus Semua</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="bento-card flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl">
        {/* Filter Controls Bar */}
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Left: Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Type Pills */}
              <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-xs font-semibold">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'all' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedType('income')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${selectedType === 'income' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-green-600'}`}
                >
                  <ArrowDownLeft size={13} />
                  Pemasukan
                </button>
                <button
                  onClick={() => setSelectedType('expense')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${selectedType === 'expense' ? 'bg-accent text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-accent'}`}
                >
                  <ArrowUpRight size={13} />
                  Pengeluaran
                </button>
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white dark:bg-gray-800 text-secondary dark:text-white text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-7 outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <Tag size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Date Pickers */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
                <CalendarIcon size={14} className="text-gray-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-secondary dark:text-white outline-none text-xs cursor-pointer"
                  title="Dari Tanggal"
                />
                <span className="text-gray-300 dark:text-gray-600">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-secondary dark:text-white outline-none text-xs cursor-pointer"
                  title="Sampai Tanggal"
                />
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={handleResetFilters}
                disabled={!isFilterActive}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  isFilterActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer ring-2 ring-amber-300 dark:ring-amber-900/50 scale-100 hover:scale-105 active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                }`}
                title="Reset semua filter ke kondisi semula"
              >
                <RotateCcw size={13} className={isFilterActive ? "animate-spin-slow" : ""} />
                <span>Reset Filter</span>
                {isFilterActive && (
                  <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right: Search Box */}
            <div className="relative min-w-[200px] w-full sm:w-auto">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi / catatan..." 
                className="w-full sm:w-60 pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 text-secondary dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Badges & Results Counter */}
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Menampilkan <strong className="text-secondary dark:text-white font-bold">{filteredTransactions.length}</strong> dari {transactions.length} transaksi
              </span>

              {isFilterActive && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedType !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        Tipe: {selectedType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        <button onClick={() => setSelectedType('all')} className="hover:opacity-75"><X size={11} /></button>
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        Kategori: {selectedCategory}
                        <button onClick={() => setSelectedCategory('all')} className="hover:opacity-75"><X size={11} /></button>
                      </span>
                    )}
                    {(startDate || endDate) && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}
                        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:opacity-75"><X size={11} /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        Kata Kunci: "{searchQuery}"
                        <button onClick={() => setSearchQuery('')} className="hover:opacity-75"><X size={11} /></button>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Filtered Totals */}
            {filteredTransactions.length > 0 && (
              <div className="flex items-center gap-3 text-[11px] font-semibold mt-1 sm:mt-0">
                <span className="text-emerald-600 dark:text-emerald-400">+{formatAmount(filteredIncome)}</span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-accent">-{formatAmount(filteredExpense)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Table & Empty States */}
        <div className="overflow-auto flex-1 p-0">
          {transactions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-4">
                <Briefcase size={28} />
              </div>
              <h3 className="text-lg font-bold text-secondary dark:text-white mb-1">Belum Ada Transaksi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                Data transaksi masih kosong. Silakan gunakan tombol tambah cepat di dashboard untuk mencatat transaksi harian Anda.
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-3xl flex items-center justify-center mb-4">
                <Filter size={28} />
              </div>
              <h3 className="text-lg font-bold text-secondary dark:text-white mb-1">Tidak Ada Transaksi yang Cocok</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">
                Tidak ditemukan transaksi dengan filter yang Anda gunakan. Silakan ubah filter atau tekan tombol reset di bawah.
              </p>
              <button 
                onClick={handleResetFilters}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium text-xs transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset Filter</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/60 sticky top-0 z-10 border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama & Catatan</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Nominal</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t.date}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-secondary dark:text-white text-sm">{t.name}</p>
                      {t.notes && (() => {
                        const match = t.notes.match(/\[Pocket:\s*([^\]]+)\]/);
                        const pocketName = match ? match[1].trim() : null;
                        const cleanNotes = t.notes.replace(/•?\s*\[Pocket:\s*[^\]]+\]/, '').trim();
                        return (
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {cleanNotes && <span className="text-xs text-gray-400 dark:text-gray-500">{cleanNotes}</span>}
                            {pocketName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                                🏷️ {pocketName}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        t.type === 'income' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' 
                          : 'bg-accent/15 dark:bg-accent/25 text-accent border border-accent/25'
                      }`}>
                        {getCategoryIcon(t.category, categories)}
                        <span>{t.category}</span>
                      </div>
                    </td>
                    <td className={`py-4 px-6 text-sm font-bold text-right whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent'}`}>
                      {t.amount > 0 ? '+' : '-'}{formatAmount(Math.abs(t.amount))}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Modal Reset All Data */}
      <ConfirmModal 
        isOpen={isResetConfirmOpen}
        title="Reset Seluruh Data Transaksi & Pocket"
        message="Apakah Anda yakin ingin menghapus seluruh data transaksi? Seluruh saldo pocket juga akan di-reset menjadi Rp 0 secara real-time. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Reset Semua Menjadi 0"
        cancelText="Batal"
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={async () => {
          await supabase.from('transactions').delete().neq('id', 0);
          setTransactions([]);
          await resetAllPockets();
          setIsResetConfirmOpen(false);
        }}
        isDestructive={true}
      />

      {/* Modal Delete Single Transaction */}
      <ConfirmModal 
        isOpen={deleteConfirmId !== null}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          if (deleteConfirmId !== null) {
            await supabase.from('transactions').delete().eq('id', deleteConfirmId);
            setTransactions(prev => prev.filter(t => t.id !== deleteConfirmId));
            setDeleteConfirmId(null);
          }
        }}
        isDestructive={true}
      />
    </div>
  );
}
