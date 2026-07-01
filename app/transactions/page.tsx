'use client';
import React, { useState } from 'react';
import { Filter, Search, Briefcase, ShoppingCart, Coffee, Lightbulb, Download, Trash2 } from 'lucide-react';
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
  const { pages, transactions, categories, setTransactions, formatAmount } = useUser();
  const pageMeta = pages.find(p => p.id === 'transactions');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleExportCSV = () => {
    const headers = ['Date', 'Name', 'Category', 'Type', 'Amount', 'Notes'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.name}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      `"${t.notes}"`
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

  return (
    <div className="flex flex-col h-full pb-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">{pageMeta?.name || 'Transactions'}</h1>
          <p className="text-gray-500">View and filter your transaction history</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-secondary border border-gray-200 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button 
            onClick={handleResetData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </header>

      <div className="bento-card flex-1 flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filter by Date:</span>
          </div>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-none rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none ring-1 ring-gray-200 focus:ring-primary text-secondary"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-none rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none ring-1 ring-gray-200 focus:ring-primary text-secondary"
          />
          
          {/* Terapkan Button */}
          <button className="bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Terapkan
          </button>

          <div className="flex-1"></div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 text-sm rounded-full border-none shadow-sm ring-1 ring-gray-200 outline-none focus:ring-primary w-48 text-secondary" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Notes</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-500">{t.date}</td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-secondary">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.notes}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {getCategoryIcon(t.category, categories)}
                      <span className="font-medium">{t.category}</span>
                    </div>
                  </td>
                  <td className={`py-4 px-6 text-sm font-semibold text-right ${t.type === 'income' ? 'text-green-500' : 'text-orange-500'}`}>
                    {t.amount > 0 ? '+' : '-'}{formatAmount(Math.abs(t.amount))}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => setDeleteConfirmId(t.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={isResetConfirmOpen}
        title="Reset All Transactions"
        message="Are you sure you want to delete all transaction data? This action cannot be undone."
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={async () => {
          await supabase.from('transactions').delete().neq('id', 0);
          setTransactions([]);
        }}
        isDestructive={true}
      />

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
