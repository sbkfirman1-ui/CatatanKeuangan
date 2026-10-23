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
  type: 'main' | 'saving' | 'budget';
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
    id: 'pocket-utama',
    name: 'Pocket Utama',
    type: 'main',
    balance: 0,
    targetAmount: 0,
    icon: 'Wallet',
    color: 'purple',
    notes: 'Penghimpun dana utama & kas induk untuk dialokasikan ke pocket lainnya',
    createdAt: new Date().toISOString(),
    history: []
  },
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

export const ensureMainPocket = (pocketList: PocketMeta[]): PocketMeta[] => {
  if (!pocketList.some(p => p.id === 'pocket-utama' || p.type === 'main')) {
    const mainPocket: PocketMeta = {
      id: 'pocket-utama',
      name: 'Pocket Utama',
      type: 'main',
      balance: 0,
      targetAmount: 0,
      icon: 'Wallet',
      color: 'purple',
      notes: 'Penghimpun dana utama & kas induk untuk dialokasikan ke pocket lainnya',
      createdAt: new Date().toISOString(),
      history: []
    };
    return [mainPocket, ...pocketList];
  }
  return pocketList;
};

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
  transferPocketFunds: (fromPocketId: string, toPocketId: string, amount: number, notes?: string) => void;
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
  txModalConfig?: { type?: 'expense' | 'income'; pocketId?: string };
  openTxModal: (type?: 'expense' | 'income' | any, pocketId?: string) => void;
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
  const [txModalConfig, setTxModalConfig] = useState<{ type?: 'expense' | 'income'; pocketId?: string }>({});

  const openTxModal = (type?: 'expense' | 'income' | any, pocketId?: string) => {
    const validType = type === 'expense' || type === 'income' ? type : undefined;
    setTxModalConfig({ type: validType, pocketId });
    setIsTxModalOpen(true);
  };

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
          const ensured = ensureMainPocket(parsed);
          setPockets(ensured);
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
              let fullPockets = ensureMainPocket(parsed);
              
              // Synchronize Pocket Utama with net cash
              const totalInc = (txs || []).filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
              const totalExp = (txs || []).filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
              const netCash = totalInc - totalExp;

              const otherAllocated = fullPockets.filter(p => p.id !== 'pocket-utama' && p.type !== 'main').reduce((acc, p) => acc + (p.balance || 0), 0);
              const calculatedMainBal = netCash <= 0 ? 0 : Math.max(0, netCash - otherAllocated);
              fullPockets = fullPockets.map(p => (p.id === 'pocket-utama' || p.type === 'main') ? { ...p, balance: calculatedMainBal } : p);

              setPockets(fullPockets);
              localStorage.setItem('pockets', JSON.stringify(fullPockets));
              savePocketsToRemote(fullPockets);
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
              const fullPockets = ensureMainPocket(remotePockets);
              setPockets(fullPockets);
              localStorage.setItem('pockets', JSON.stringify(fullPockets));
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
    if (id === 'pocket-utama') return; // Cannot delete Pocket Utama
    setPockets(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('pockets', JSON.stringify(updated));
      savePocketsToRemote(updated);
      return updated;
    });
  };

  // 1. Total Cash Balance from Transactions
  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalCashFlow = totalIncome - totalExpense;

  // 2. Total allocated to sub-pockets (excluding Pocket Utama)
  const totalSubPocketsAllocated = useMemo(() => {
    return pockets
      .filter(p => p.id !== 'pocket-utama' && p.type !== 'main')
      .reduce((acc, p) => acc + (p.balance || 0), 0);
  }, [pockets]);

  // 3. Dynamic Pocket Utama Balance:
  // INTEGRASI KAS & POCKET UTAMA:
  // - Bila Saldo Kas <= 0, Pocket Utama strictly bernilai 0
  // - Bila Saldo Kas > 0, Pocket Utama = Math.max(0, totalCashFlow - totalSubPocketsAllocated)
  const mainPocketBalance = useMemo(() => {
    if (totalCashFlow <= 0) return 0;
    return Math.max(0, totalCashFlow - totalSubPocketsAllocated);
  }, [totalCashFlow, totalSubPocketsAllocated]);

  // 4. Integrated Pockets exposed to all components
  const integratedPockets = useMemo(() => {
    return pockets.map(p => {
      if (p.id === 'pocket-utama' || p.type === 'main') {
        return {
          ...p,
          balance: mainPocketBalance
        };
      }
      return p;
    });
  }, [pockets, mainPocketBalance]);

  const allocatePocketFunds = (pocketId: string, amount: number, type: 'deposit' | 'withdraw', notes?: string) => {
    setPockets(prev => {
      const isTargetMain = pocketId === 'pocket-utama';
      const updated = prev.map(p => {
        const isThisMain = p.id === 'pocket-utama' || p.type === 'main';
        if (p.id !== pocketId && !(isTargetMain && isThisMain)) return p;
        
        const delta = type === 'deposit' ? amount : -amount;
        const newBalance = isThisMain 
          ? mainPocketBalance 
          : Math.max(0, (p.balance || 0) + delta);

        const historyItem: PocketHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          pocketId: p.id,
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

  const transferPocketFunds = (
    fromPocketId: string, 
    toPocketId: string, 
    amount: number, 
    notes?: string
  ) => {
    if (fromPocketId === toPocketId || amount <= 0) return;
    
    setPockets(prev => {
      const fromPocket = prev.find(p => p.id === fromPocketId || (fromPocketId === 'pocket-utama' && p.type === 'main'));
      const toPocket = prev.find(p => p.id === toPocketId || (toPocketId === 'pocket-utama' && p.type === 'main'));
      if (!fromPocket || !toPocket) return prev;

      const isFromMain = fromPocket.id === 'pocket-utama' || fromPocket.type === 'main';
      const isToMain = toPocket.id === 'pocket-utama' || toPocket.type === 'main';

      const fromBal = isFromMain ? mainPocketBalance : (fromPocket.balance || 0);
      if (amount > fromBal) return prev;

      const now = new Date().toISOString();
      const transferNoteFrom = notes ? `Alokasi ke ${toPocket.name}: ${notes}` : `Alokasi dana ke ${toPocket.name}`;
      const transferNoteTo = notes ? `Alokasi dari ${fromPocket.name}: ${notes}` : `Alokasi masuk dari ${fromPocket.name}`;

      const fromHist: PocketHistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-out`,
        pocketId: fromPocket.id,
        pocketName: fromPocket.name,
        pocketIcon: fromPocket.icon,
        pocketColor: fromPocket.color,
        type: 'withdraw',
        amount,
        notes: transferNoteFrom,
        date: now
      };

      const toHist: PocketHistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-in`,
        pocketId: toPocket.id,
        pocketName: toPocket.name,
        pocketIcon: toPocket.icon,
        pocketColor: toPocket.color,
        type: 'deposit',
        amount,
        notes: transferNoteTo,
        date: now
      };

      const updated = prev.map(p => {
        if (p.id === fromPocket.id) {
          return {
            ...p,
            balance: isFromMain ? Math.max(0, mainPocketBalance - amount) : Math.max(0, (p.balance || 0) - amount),
            history: [fromHist, ...(p.history || [])]
          };
        }
        if (p.id === toPocket.id) {
          return {
            ...p,
            balance: isToMain ? mainPocketBalance + amount : (p.balance || 0) + amount,
            history: [toHist, ...(p.history || [])]
          };
        }
        return p;
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
    pockets: integratedPockets, 
    setPockets,
    addPocket, updatePocket, deletePocket, allocatePocketFunds, transferPocketFunds,
    theme, toggleTheme,
    isAppLocked, setIsAppLocked,
    isBalanceHidden, setIsBalanceHidden,
    toggleBalanceVisibility,
    formatAmount,
    isTxModalOpen, setIsTxModalOpen, openTxModal,
    txModalConfig
  }), [userName, userIcon, pages, dashboardLabels, categories, transactions, shoppingItems, integratedPockets, theme, isAppLocked, isBalanceHidden, isTxModalOpen, txModalConfig]);

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
