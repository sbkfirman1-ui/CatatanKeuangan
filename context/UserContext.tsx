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
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAppLocked: boolean;
  setIsAppLocked: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('Nico');
  const [userIcon, setUserIcon] = useState('User');
  const [pages, setPages] = useState<PageMeta[]>([
    { id: 'dashboard', path: '/', name: 'Dashboard', icon: 'Layout' },
    { id: 'transactions', path: '/transactions', name: 'Transactions', icon: 'List' },
    { id: 'statement', path: '/statement', name: 'Laporan', icon: 'PieChart' },
    { id: 'categories', path: '/categories', name: 'Categories', icon: 'Grid' },
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAppLocked, setIsAppLocked] = useState(true); // Start locked (showing intro)

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

    // Fetch data from Supabase
    const fetchData = async () => {
      const { data: txs } = await supabase.from('transactions').select('*').order('date', { ascending: false }).order('id', { ascending: false });
      if (txs) setTransactions(txs);
      
      const { data: cats } = await supabase.from('categories').select('*').order('id', { ascending: true });
      if (cats && cats.length > 0) setCategories(cats);
      
      const { data: items } = await supabase.from('shopping_items').select('*').order('id', { ascending: false });
      if (items) setShoppingItems(items);
    };
    fetchData();

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

  const contextValue = useMemo(() => ({
    userName, setUserName, 
    userIcon, setUserIcon, 
    pages, setPages, 
    dashboardLabels, setDashboardLabels,
    categories, setCategories,
    transactions, setTransactions,
    shoppingItems, setShoppingItems,
    theme, toggleTheme,
    isAppLocked, setIsAppLocked
  }), [userName, userIcon, pages, dashboardLabels, categories, transactions, shoppingItems, theme, isAppLocked]);

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
