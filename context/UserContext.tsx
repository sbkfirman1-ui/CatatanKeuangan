'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export type PageMeta = {
  id: string;
  path: string;
  name: string;
  icon: string;
};

export type DashboardLabels = {
  totalBalance: string;
  income: string;
  expense: string;
  profitAndLoss: string;
  recent: string;
  analytics: string;
};

export type CategoryMeta = {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
};

export type TransactionMeta = {
  id: number;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  notes?: string;
};

export type ShoppingItem = {
  id: number;
  name: string;
  store: string;
  price: number;
  date?: string;
};

export type PocketHistoryItem = {
  id: string;
  pocketId: string;
  pocketName?: string;
  pocketIcon?: string;
  pocketColor?: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  notes?: string;
  date: string;
};

export type PocketMeta = {
  id: string;
  name: string;
  type: 'saving' | 'budget';
  balance: number;
  targetAmount?: number;
  icon: string;
  color: string;
  notes?: string;
  createdAt: string;
  history?: PocketHistoryItem[];
};

export const DEFAULT_POCKETS: PocketMeta[] = [
  {
    id: 'pocket-istri',
    name: 'Uang Istri',
    type: 'budget',
    balance: 0,
    targetAmount: 1500000,
    icon: 'Shield',
    color: 'blue',
    notes: 'Uang Bulanan Istri untuk Belanja dll',
    createdAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pocket-suami',
    name: 'Uang Suami',
    type: 'budget',
    balance: 0,
    targetAmount: 300000,
    icon: 'Coffee',
    color: 'blue',
    notes: 'Untuk Beli Bensin Bulanan',
    createdAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pocket-liburan',
    name: 'Uang Liburan',
    type: 'saving',
    balance: 0,
    targetAmount: 2000000,
    icon: 'Plane',
    color: 'blue',
    notes: 'Rencana liburan & refreshing keluarga',
    createdAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pocket-bayi',
    name: 'Uang Bayi',
    type: 'saving',
    balance: 0,
    targetAmount: 5000000,
    icon: 'Wallet',
    color: 'blue',
    notes: 'Untuk keperluan Bayi',
    createdAt: new Date().toISOString(),
    history: []
  }
];

const SYSTEM_POCKETS_ID = 999999999;
const SYSTEM_POCKETS_NAME = '__SYSTEM_POCKETS__';

// Helper to save pockets to Supabase cloud
const savePocketsToRemote = async (updatedPockets: PocketMeta[]) => {
  try {
    await supabase.from('shopping_items').upsert({
      id: SYSTEM_POCKETS_ID,
      name: SYSTEM_POCKETS_NAME,
      store: JSON.stringify(updatedPockets),
      price: 0,
      date: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to sync pockets to Supabase:', err);
  }
};

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
  userIcon: string;
  setUserIcon: (icon: string) => void;
  pages: PageMeta[];
  setPages: React.Dispatch<React.SetStateAction<PageMeta[]>>;
  dashboardLabels: DashboardLabels;
  setDashboardLabels: React.Dispatch<React.SetStateAction<DashboardLabels>>;
  categories: CategoryMeta[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryMeta[]>>;
  transactions: TransactionMeta[];
  setTransactions: React.Dispatch<React.SetStateAction<TransactionMeta[]>>;
  shoppingItems: ShoppingItem[];
  setShoppingItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  pockets: PocketMeta[];
  setPockets: React.Dispatch<React.SetStateAction<PocketMeta[]>>;
  addPocket: (pocket: Omit<PocketMeta, 'id' | 'createdAt' | 'history'>) => void;
  updatePocket: (id: string, updates: Partial<PocketMeta>) => void;
  deletePocket: (id: string) => void;
  allocatePocketFunds: (pocketId: string, amount: number, type: 'deposit' | 'withdraw', notes?: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAppLocked: boolean;
  setIsAppLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isBalanceHidden: boolean;
  setIsBalanceHidden: React.Dispatch<React.SetStateAction<boolean>>;
  toggleBalanceVisibility: () => void;
  formatAmount: (amount: number, prefix?: string) => string;
  isTxModalOpen: boolean;
  setIsTxModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openTxModal: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('Nico');
  const [userIcon, setUserIcon] = useState('User');
  const [pages, setPages] = useState<PageMeta[]>([
    { id: 'dashboard', path: '/', name: 'Dashboard', icon: 'Layout' },
    { id: 'transactions', path: '/transactions', name: 'Transactions', icon: 'List' },
    { id: 'pocket', path: '/pocket', name: 'Pocket', icon: 'Wallet' },
    { id: 'shopping', path: '/shopping', name: 'Catatan Belanja', icon: 'ShoppingCart' }
  ]);
  const [dashboardLabels, setDashboardLabels] = useState<DashboardLabels>({
    totalBalance: 'CASH FLOW',
    income: 'Income',
    expense: 'Expense',
    profitAndLoss: 'Profit and Los',
    recent: 'Recent',
    analytics: 'Analytics Summary'
  });

  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [transactions, setTransactions] = useState<TransactionMeta[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [pockets, setPockets] = useState<PocketMeta[]>(DEFAULT_POCKETS);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAppLocked, setIsAppLocked] = useState(true); // Start locked (showing intro)
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const openTxModal = () => setIsTxModalOpen(true);

  useEffect(() => {
    // Check if user has a preference in localStorage or system
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
    
    const savedIcon = localStorage.getItem('userIcon');
    if (savedIcon) setUserIcon(savedIcon);

    const savedPages = localStorage.getItem('pages');
    if (savedPages) {
      try {
        let parsed = JSON.parse(savedPages);
        if (Array.isArray(parsed)) {
          // Remove statement & categories page from main navigation
          parsed = parsed.filter((p: any) => 
            p.id !== 'statement' && p.path !== '/statement' &&
            p.id !== 'categories' && p.path !== '/categories'
          );
          // If pocket page is not present in saved pages, add it
          if (!parsed.some((p: any) => p.id === 'pocket')) {
            parsed.splice(2, 0, { id: 'pocket', path: '/pocket', name: 'Pocket', icon: 'Wallet' });
          }
          localStorage.setItem('pages', JSON.stringify(parsed));
          setPages(parsed);
        }
      } catch (e) {}
    }

    const savedLabels = localStorage.getItem('dashboardLabels');
    if (savedLabels) {
      try { setDashboardLabels(JSON.parse(savedLabels)); } catch (e) {}
    }

    const savedHidden = localStorage.getItem('isBalanceHidden');
    if (savedHidden) setIsBalanceHidden(savedHidden === 'true');

    // Load pockets from localStorage
    const savedPockets = localStorage.getItem('pockets');
    if (savedPockets) {
      try {
        const parsed = JSON.parse(savedPockets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPockets(parsed);
        }
      } catch (e) {}
    }

    // Fetch data from Supabase
    const fetchData = async () => {
      const { data: txs } = await supabase.from('transactions').select('*').order('date', { ascending: false }).order('id', { ascending: false });
      if (txs) setTransactions(txs);
      
      const { data: cats } = await supabase.from('categories').select('*').order('id', { ascending: true });
      if (cats && cats.length > 0) setCategories(cats);
      
      const { data: items } = await supabase.from('shopping_items').select('*').order('id', { ascending: false });
      if (items) {
        // Extract system pockets storage record
        const pocketRow = items.find((it: any) => it.id === SYSTEM_POCKETS_ID || it.name === SYSTEM_POCKETS_NAME);
        if (pocketRow && pocketRow.store) {
          try {
            const parsed = JSON.parse(pocketRow.store);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPockets(parsed);
              localStorage.setItem('pockets', JSON.stringify(parsed));
            }
          } catch (e) {
            console.error('Error parsing remote pockets:', e);
          }
        } else {
          // If not in cloud yet, seed with current/default pockets
          savePocketsToRemote(DEFAULT_POCKETS);
        }
        
        // Filter out system configuration row from shopping items
        const realShoppingItems = items.filter((it: any) => it.id !== SYSTEM_POCKETS_ID && it.name !== SYSTEM_POCKETS_NAME);
        setShoppingItems(realShoppingItems);
      }
    };
    fetchData();

    // Supabase Realtime listener to synchronize pockets across devices (Desktop, HP, Tab)
    const realtimeChannel = supabase
      .channel('realtime_pockets_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, (payload) => {
        const row = payload.new as any;
        if (row && (row.id === SYSTEM_POCKETS_ID || row.name === SYSTEM_POCKETS_NAME) && row.store) {
          try {
            const remotePockets = JSON.parse(row.store);
            if (Array.isArray(remotePockets) && remotePockets.length > 0) {
              setPockets(remotePockets);
              localStorage.setItem('pockets', JSON.stringify(remotePockets));
            }
          } catch (e) {
            console.error('Realtime sync parse error:', e);
          }
        }
      })
      .subscribe();

    // Idle Timer Logic (5 minutes = 300,000 ms)
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Only set timeout if app is NOT locked, to avoid unnecessary triggers
      timeoutId = setTimeout(() => {
        setIsAppLocked(true);
      }, 5 * 60 * 1000); 
    };

    // Events that indicate user is active
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initialize timer on mount
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(realtimeChannel);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(prev => {
      const newState = !prev;
      localStorage.setItem('isBalanceHidden', String(newState));
      return newState;
    });
  };

  const formatAmount = (amount: number, prefix: string = 'Rp ') => {
    if (isBalanceHidden) return `${prefix}••••••`;
    return `${prefix}${amount.toLocaleString('id-ID')}`;
  };

  const addPocket = (newPocketData: Omit<PocketMeta, 'id' | 'createdAt' | 'history'>) => {
    const newPocket: PocketMeta = {
      ...newPocketData,
      id: `pocket-${Date.now()}`,
      createdAt: new Date().toISOString(),
      history: []
    };
    setPockets(prev => {
      const updated = [...prev, newPocket];
      localStorage.setItem('pockets', JSON.stringify(updated));
      savePocketsToRemote(updated);
      return updated;
    });
  };

  const updatePocket = (id: string, updates: Partial<PocketMeta>) => {
    setPockets(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem('pockets', JSON.stringify(updated));
      savePocketsToRemote(updated);
      return updated;
    });
  };

  const deletePocket = (id: string) => {
    setPockets(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('pockets', JSON.stringify(updated));
      savePocketsToRemote(updated);
      return updated;
    });
  };

  const allocatePocketFunds = (pocketId: string, amount: number, type: 'deposit' | 'withdraw', notes?: string) => {
    setPockets(prev => {
      const updated = prev.map(p => {
        if (p.id !== pocketId) return p;
        const delta = type === 'deposit' ? amount : -amount;
        const newBalance = Math.max(0, (p.balance || 0) + delta);
        const historyItem: PocketHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          pocketId,
          pocketName: p.name,
          pocketIcon: p.icon,
          pocketColor: p.color,
          type,
          amount,
          notes: notes || (type === 'deposit' ? 'Alokasi Masuk' : 'Penarikan Dana'),
          date: new Date().toISOString()
        };
        return {
          ...p,
          balance: newBalance,
          history: [historyItem, ...(p.history || [])]
        };
      });
      localStorage.setItem('pockets', JSON.stringify(updated));
      savePocketsToRemote(updated);
      return updated;
    });
  };

  const contextValue = useMemo(() => ({
    userName, setUserName, 
    userIcon, setUserIcon, 
    pages, setPages, 
    dashboardLabels, setDashboardLabels,
    categories, setCategories,
    transactions, setTransactions,
    shoppingItems, setShoppingItems,
    pockets, setPockets,
    addPocket, updatePocket, deletePocket, allocatePocketFunds,
    theme, toggleTheme,
    isAppLocked, setIsAppLocked,
    isBalanceHidden, setIsBalanceHidden,
    toggleBalanceVisibility,
    formatAmount,
    isTxModalOpen, setIsTxModalOpen, openTxModal
  }), [userName, userIcon, pages, dashboardLabels, categories, transactions, shoppingItems, pockets, theme, isAppLocked, isBalanceHidden, isTxModalOpen]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
