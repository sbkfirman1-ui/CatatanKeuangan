'use client';
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Save, Check, ChevronDown, ChevronUp, Plus, Trash2, X,
  Coffee, ShoppingCart, Lightbulb, Banknote, Car, Pizza, Gift, Briefcase, Zap, Heart,
  Plane, Home, GraduationCap, DollarSign, Wallet, Shield, PiggyBank, TrendingUp, Coins, Tag,
  Utensils, LayoutGrid, Sliders, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, PageMeta, DashboardLabels } from '@/context/UserContext';
import { AVAILABLE_ICONS } from '@/components/Sidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { supabase } from '@/lib/supabase';

// Category Icons Dictionary
const CATEGORY_ICON_OPTIONS: Record<string, React.ReactNode> = {
  Coffee: <Coffee size={20} />,
  Pizza: <Pizza size={20} />,
  Utensils: <Utensils size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  Car: <Car size={20} />,
  Plane: <Plane size={20} />,
  Home: <Home size={20} />,
  Lightbulb: <Lightbulb size={20} />,
  Banknote: <Banknote size={20} />,
  Coins: <Coins size={20} />,
  Wallet: <Wallet size={20} />,
  PiggyBank: <PiggyBank size={20} />,
  Briefcase: <Briefcase size={20} />,
  Gift: <Gift size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  Heart: <Heart size={20} />,
  Shield: <Shield size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Zap: <Zap size={20} />,
  Tag: <Tag size={20} />
};

export default function SettingsPage() {
  const { 
    userName, setUserName, 
    userIcon, setUserIcon, 
    pages, setPages, 
    dashboardLabels, setDashboardLabels,
    categories, setCategories 
  } = useUser();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'categories' | 'pages' | 'labels' | 'profile'>('categories');

  // Form States
  const [localName, setLocalName] = useState(userName);
  const [localIcon, setLocalIcon] = useState(userIcon);
  const [localPages, setLocalPages] = useState<PageMeta[]>(pages);
  const [localDashboardLabels, setLocalDashboardLabels] = useState<DashboardLabels>(dashboardLabels);
  
  const [isSaved, setIsSaved] = useState(false);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  // Category Management States
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatIcon, setNewCatIcon] = useState<string>('Coffee');
  const [catDeleteConfirmId, setCatDeleteConfirmId] = useState<number | null>(null);

  const handleSave = () => {
    setUserName(localName);
    setUserIcon(localIcon);
    localStorage.setItem('userName', localName);
    localStorage.setItem('userIcon', localIcon);
    localStorage.setItem('pages', JSON.stringify(localPages));
    localStorage.setItem('dashboardLabels', JSON.stringify(localDashboardLabels));
    setPages(localPages);
    setDashboardLabels(localDashboardLabels);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const updatePage = (id: string, key: keyof PageMeta, value: string) => {
    setLocalPages(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const updateLabel = (key: keyof DashboardLabels, value: string) => {
    setLocalDashboardLabels(prev => ({ ...prev, [key]: value }));
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategory = { 
      id: Date.now(),
      name: newCatName.trim(), 
      icon: newCatIcon, 
      type: newCatType 
    };
    
    const { data, error } = await supabase.from('categories').insert([newCategory]).select();
    
    if (!error && data) {
      setCategories(prev => [...prev, data[0]]);
    } else {
      // Fallback local addition if supabase offline
      setCategories(prev => [...prev, newCategory]);
    }
    
    setIsCatModalOpen(false);
    setNewCatName('');
    setNewCatType('expense');
    setNewCatIcon('Coffee');
  };

  // Delete Category Handler
  const handleDeleteCategory = async () => {
    if (catDeleteConfirmId !== null) {
      await supabase.from('categories').delete().eq('id', catDeleteConfirmId);
      setCategories(prev => prev.filter(c => c.id !== catDeleteConfirmId));
      setCatDeleteConfirmId(null);
    }
  };

  const filteredCategories = categories.filter(c => {
    if (categoryFilter === 'all') return true;
    return c.type === categoryFilter;
  });

  const incomeCategoriesCount = categories.filter(c => c.type === 'income').length;
  const expenseCategoriesCount = categories.filter(c => c.type === 'expense').length;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400">
            <SettingsIcon size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white tracking-tight">Pengaturan</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola kategori transaksi, kustomisasi halaman, label teks, dan profil</p>
          </div>
        </div>
        
        {/* Save Button */}
        <button 
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto ${
            isSaved ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-primary hover:bg-primary-hover text-white'
          }`}
        >
          {isSaved ? <Check size={18} /> : <Save size={18} />}
          <span>{isSaved ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
        </button>
      </header>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Tag size={15} />
          <span>Kategori Transaksi ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pages'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <LayoutGrid size={15} />
          <span>Kustomisasi Halaman</span>
        </button>

        <button
          onClick={() => setActiveTab('labels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'labels'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Sliders size={15} />
          <span>Label Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <UserIcon size={15} />
          <span>Profil Pengguna</span>
        </button>
      </div>

      {/* Tab 1: Kategori Transaksi */}
      {activeTab === 'categories' && (
        <div className="bento-card p-6 md:p-8 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-secondary dark:text-white mb-1">Kategori Transaksi</h2>
              <p className="text-xs text-gray-400">Atur pos kategori untuk transaksi pemasukan dan pengeluaran harian Anda.</p>
            </div>
            
            <button 
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Kategori</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-6 text-xs font-semibold">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'all' 
                  ? 'bg-secondary dark:bg-white text-white dark:text-secondary shadow-xs' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              Semua ({categories.length})
            </button>
            <button
              onClick={() => setCategoryFilter('income')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'income' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              Pemasukan ({incomeCategoriesCount})
            </button>
            <button
              onClick={() => setCategoryFilter('expense')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                categoryFilter === 'expense' 
                  ? 'bg-accent text-white shadow-xs' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-accent/10 hover:text-accent'
              }`}
            >
              Pengeluaran ({expenseCategoriesCount})
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCategories.map((cat) => {
              const isIncome = cat.type === 'income';
              const IconComp = CATEGORY_ICON_OPTIONS[cat.icon] || <Tag size={20} />;

              return (
                <div 
                  key={cat.id} 
                  className="p-4 rounded-2xl border border-[var(--border)] bg-gray-50/60 dark:bg-gray-900/40 flex items-center justify-between hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                        : 'bg-accent/15 text-accent dark:bg-accent/25'
                    }`}>
                      {IconComp}
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary dark:text-white text-sm">{cat.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-accent/10 text-accent dark:bg-accent/20'
                      }`}>
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCatDeleteConfirmId(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Kustomisasi Halaman */}
      {activeTab === 'pages' && (
        <div className="bento-card p-6 md:p-8 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold text-secondary dark:text-white mb-1">Kustomisasi Halaman</h2>
          <p className="text-xs text-gray-400 mb-6">Ubah nama dan ikon menu navigasi utama sesuai preferensi Anda.</p>
          
          <div className="flex flex-col gap-3.5">
            {localPages.map((page, index) => (
              <div key={page.id} className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)]">
                <button 
                  onClick={() => setExpandedPageId(expandedPageId === page.id ? null : page.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl">
                      {AVAILABLE_ICONS[page.icon] || <Tag size={20} />}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Halaman {index + 1}</p>
                      <p className="font-bold text-secondary dark:text-white text-sm">{page.name}</p>
                    </div>
                  </div>
                  {expandedPageId === page.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                <AnimatePresence>
                  {expandedPageId === page.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-4 bg-white dark:bg-gray-900/30"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nama Halaman</label>
                        <input 
                          type="text" 
                          value={page.name}
                          onChange={(e) => updatePage(page.id, 'name', e.target.value)}
                          className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Pilih Ikon Halaman</label>
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => updatePage(page.id, 'icon', iconName)}
                              className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                page.icon === iconName 
                                ? 'bg-primary text-white shadow-sm scale-105' 
                                : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white'
                              }`}
                            >
                              {React.cloneElement(AVAILABLE_ICONS[iconName] as React.ReactElement, { size: 18 })}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Label Dashboard */}
      {activeTab === 'labels' && (
        <div className="bento-card p-6 md:p-8 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-secondary dark:text-white mb-1">Label Teks Dashboard</h2>
            <p className="text-xs text-gray-400">Sesuaikan teks metrik dan kartu ringkasan di dashboard utama.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Label Total Saldo / Cash Flow</label>
              <input 
                type="text" 
                value={localDashboardLabels.totalBalance}
                onChange={(e) => updateLabel('totalBalance', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Label Pemasukan (Income)</label>
              <input 
                type="text" 
                value={localDashboardLabels.income}
                onChange={(e) => updateLabel('income', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Label Pengeluaran (Expense)</label>
              <input 
                type="text" 
                value={localDashboardLabels.expense}
                onChange={(e) => updateLabel('expense', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Judul Grafik Arus Kas</label>
              <input 
                type="text" 
                value={localDashboardLabels.profitAndLoss}
                onChange={(e) => updateLabel('profitAndLoss', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Label Aktivitas Terbaru (Recent)</label>
              <input 
                type="text" 
                value={localDashboardLabels.recent}
                onChange={(e) => updateLabel('recent', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Label Ringkasan Analitik</label>
              <input 
                type="text" 
                value={localDashboardLabels.analytics}
                onChange={(e) => updateLabel('analytics', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Profil Pengguna */}
      {activeTab === 'profile' && (
        <div className="bento-card p-6 md:p-8 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-secondary dark:text-white mb-1">Nama Panggilan</h2>
            <p className="text-xs text-gray-400 mb-3">Nama Anda yang ditampilkan pada sapaan dashboard dan profil sidebar.</p>
            <input 
              type="text" 
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Nama Anda"
              className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-secondary dark:text-white font-medium text-sm"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-secondary dark:text-white mb-1">Avatar / Ikon Profil</h2>
            <p className="text-xs text-gray-400 mb-3">Pilih ikon avatar untuk profil Anda di sidebar.</p>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 h-44 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setLocalIcon(iconName)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    localIcon === iconName 
                    ? 'bg-primary text-white shadow-sm scale-105' 
                    : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white'
                  }`}
                >
                  {React.cloneElement(AVAILABLE_ICONS[iconName] as React.ReactElement, { size: 18 })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-bold text-secondary dark:text-white">Tambah Kategori Baru</h3>
                <p className="text-xs text-gray-400 mt-0.5">Buat pos kategori untuk pemasukan atau pengeluaran</p>
              </div>
              <button 
                onClick={() => setIsCatModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">NAMA KATEGORI</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Misal: Tagihan Listrik, Bonus, Sedekah"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">TIPE KATEGORI</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('expense')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newCatType === 'expense'
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Pengeluaran (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('income')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newCatType === 'income'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Pemasukan (+)
                  </button>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">PILIH IKON VISUAL</label>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-[var(--border)]">
                  {Object.keys(CATEGORY_ICON_OPTIONS).map((iconKey) => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setNewCatIcon(iconKey)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        newCatIcon === iconKey
                          ? 'bg-primary text-white shadow-sm scale-105'
                          : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary'
                      }`}
                    >
                      {CATEGORY_ICON_OPTIONS[iconKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Hapus Kategori */}
      <ConfirmModal 
        isOpen={catDeleteConfirmId !== null}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Kategori yang dihapus tidak dapat dipulihkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onCancel={() => setCatDeleteConfirmId(null)}
        onConfirm={handleDeleteCategory}
        isDestructive={true}
      />
    </div>
  );
}
