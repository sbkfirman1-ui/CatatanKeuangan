'use client';
import React, { useState } from 'react';
import { Plus, Trash2, X, Coffee, ShoppingCart, Lightbulb, Banknote, Car, Pizza, Gift, Briefcase, Zap, Heart } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import ConfirmModal from '@/components/ConfirmModal';
import { supabase } from '@/lib/supabase';

const ICON_OPTIONS = {
  Coffee: <Coffee size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  Banknote: <Banknote size={24} />,
  Car: <Car size={24} />,
  Pizza: <Pizza size={24} />,
  Gift: <Gift size={24} />,
  Briefcase: <Briefcase size={24} />,
  Zap: <Zap size={24} />,
  Heart: <Heart size={24} />,
};

type IconName = keyof typeof ICON_OPTIONS;

export default function CategoriesPage() {
  const { pages, categories, setCategories } = useUser();
  const pageMeta = pages.find(p => p.id === 'categories');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newIcon, setNewIcon] = useState<IconName>('Coffee');

  const [confirmState, setConfirmState] = useState<{isOpen: boolean, categoryId: number | null}>({
    isOpen: false,
    categoryId: null
  });

  const handleDelete = (id: number) => {
    setConfirmState({ isOpen: true, categoryId: id });
  };

  const confirmDelete = async () => {
    if (confirmState.categoryId !== null) {
      await supabase.from('categories').delete().eq('id', confirmState.categoryId);
      setCategories(categories.filter(c => c.id !== confirmState.categoryId));
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const newCategory = { 
      id: Date.now(),
      name: newName, 
      icon: newIcon, 
      type: newType 
    };
    
    const { data, error } = await supabase.from('categories').insert([newCategory]).select();
    
    if (!error && data) {
      setCategories([...categories, data[0]]);
    }
    
    setIsModalOpen(false);
    setNewName('');
    setNewType('expense');
    setNewIcon('Coffee');
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">{pageMeta?.name || 'Categories'}</h1>
          <p className="text-gray-500">Manage your income and expense categories</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bento-card p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm 
                ${category.type === 'expense' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}
              `}>
                {ICON_OPTIONS[category.icon as IconName] || <Zap size={24} />}
              </div>
              <div>
                <h3 className="font-semibold text-secondary">{category.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full 
                  ${category.type === 'expense' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}
                `}>
                  {category.type}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(category.id)}
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete Category"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Add Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary">New Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-secondary transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Category Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Shopping"
                  className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary"
                />
              </div>

              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
                <div className="flex bg-gray-50 p-1 rounded-xl ring-1 ring-gray-200">
                  <button 
                    onClick={() => setNewType('expense')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${newType === 'expense' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-secondary'}`}
                  >
                    Pengeluaran (Expense)
                  </button>
                  <button 
                    onClick={() => setNewType('income')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${newType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-secondary'}`}
                  >
                    Pemasukan (Income)
                  </button>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Icon</label>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(ICON_OPTIONS) as IconName[]).map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => setNewIcon(iconName)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                        newIcon === iconName 
                        ? (newType === 'expense' ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500' : 'bg-green-100 text-green-600 ring-2 ring-green-500')
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-secondary'
                      }`}
                    >
                      {ICON_OPTIONS[iconName]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-primary hover:bg-orange-600 transition-colors shadow-md"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini mungkin akan terpengaruh."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onCancel={() => setConfirmState({ isOpen: false, categoryId: null })}
        onConfirm={confirmDelete}
        isDestructive={true}
      />
    </>
  );
}
