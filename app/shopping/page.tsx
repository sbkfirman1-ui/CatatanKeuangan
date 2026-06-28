'use client';
import React, { useState } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, X, Save, Store, Tag, Calendar } from 'lucide-react';
import { useUser, ShoppingItem } from '@/context/UserContext';
import ConfirmModal from '@/components/ConfirmModal';
import { supabase } from '@/lib/supabase';

export default function ShoppingPage() {
  const { pages, shoppingItems, setShoppingItems } = useUser();
  const pageMeta = pages.find(p => p.id === 'shopping');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [itemName, setItemName] = useState('');
  const [itemStore, setItemStore] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);

  const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const openModal = (item?: ShoppingItem) => {
    if (item) {
      setEditingId(item.id);
      setItemName(item.name);
      setItemStore(item.store);
      setItemPrice(item.price.toString());
      setItemDate(item.date || new Date().toISOString().split('T')[0]);
    } else {
      setEditingId(null);
      setItemName('');
      setItemStore('');
      setItemPrice('');
      setItemDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!itemName || !itemStore || !itemPrice) return;
    
    if (editingId !== null) {
      const updatedItem = {
        name: itemName,
        store: itemStore,
        price: parseInt(itemPrice.replace(/\D/g, '') || '0'),
        date: itemDate
      };
      
      await supabase.from('shopping_items').update(updatedItem).eq('id', editingId);
      
      setShoppingItems(items => items.map(i => 
        i.id === editingId ? { ...i, ...updatedItem } : i
      ));
    } else {
      const newItem = {
        id: Date.now(),
        name: itemName,
        store: itemStore,
        price: parseInt(itemPrice.replace(/\D/g, '') || '0'),
        date: itemDate
      };
      
      const { data, error } = await supabase.from('shopping_items').insert([newItem]).select();
      
      if (!error && data) {
        setShoppingItems(items => [data[0], ...items]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Catatan',
      message: 'Apakah Anda yakin ingin menghapus catatan belanja ini?',
      onConfirm: async () => {
        await supabase.from('shopping_items').delete().eq('id', id);
        setShoppingItems(items => items.filter(i => i.id !== id));
      }
    });
  };

  const handleResetData = () => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Data',
      message: 'Apakah Anda yakin ingin menghapus SEMUA catatan belanja? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        await supabase.from('shopping_items').delete().neq('id', 0);
        setShoppingItems([]);
      }
    });
  };

  const formatRupiah = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric) return '';
    return parseInt(numeric, 10).toLocaleString('id-ID');
  };

  return (
    <div className="flex flex-col h-full pb-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary dark:text-white tracking-tight">{pageMeta?.name || 'Catatan Belanja'}</h1>
          <p className="text-gray-500 dark:text-gray-400">Catat daftar belanja harian Anda agar lebih terorganisir.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => handleResetData()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-2xl font-bold transition-colors shadow-sm dark:bg-red-900/30 dark:hover:bg-red-900/50"
          >
            <Trash2 size={20} />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
          <button 
            onClick={() => openModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-sm shadow-orange-200/50 dark:shadow-none hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>Tambah Belanja</span>
          </button>
        </div>
      </header>

      <div className="bento-card flex-1 p-4 md:p-6 flex flex-col">
        {shoppingItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
              <ShoppingCart size={40} className="opacity-50" />
            </div>
            <p className="font-medium text-lg">Belum ada catatan belanja</p>
            <p className="text-sm mt-1 text-center">Catat pengeluaran Anda hari ini dengan mengklik tombol Tambah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shoppingItems.map(item => (
              <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl flex flex-col gap-4 group transition-colors hover:border-gray-200 dark:hover:border-gray-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-secondary dark:text-white text-lg">{item.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                      <div className="flex items-center gap-1">
                        <Store size={14} />
                        {item.store}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(item)} className="p-2 bg-white dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600 text-gray-500 hover:text-primary rounded-xl shadow-sm transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 rounded-xl shadow-sm transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1"><Tag size={14} /> Harga</span>
                  <span className="font-bold text-primary text-xl">Rp {item.price.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Input */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-secondary/20 dark:bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div 
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-xl text-secondary dark:text-white">{editingId ? 'Edit Belanjaan' : 'Catat Belanjaan'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Nama Barang</label>
                  <input 
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)} 
                    placeholder="Contoh: Sabun Cuci"
                    className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-800 font-medium text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Tanggal Belanja</label>
                  <input 
                    type="date"
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)} 
                    className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-800 font-medium text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Pilihan Toko</label>
                  <input 
                    type="text"
                    value={itemStore}
                    onChange={(e) => setItemStore(e.target.value)} 
                    placeholder="Contoh: Indomaret, Superindo"
                    className="w-full border-none rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-gray-800 font-medium text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Harga per Item</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input 
                      type="text"
                      value={itemPrice ? formatRupiah(itemPrice) : ''}
                      onChange={(e) => setItemPrice(e.target.value)} 
                      placeholder="0"
                      className="w-full border-none rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 font-bold text-xl text-secondary dark:text-white outline-none ring-2 ring-transparent focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={!itemName || !itemStore || !itemPrice}
                  className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition-colors shadow-sm"
                >
                  <Save size={20} />
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        )}
        
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        isDestructive={true}
      />
    </div>
  );
}
