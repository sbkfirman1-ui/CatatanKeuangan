'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Activity, TrendingUp, Settings, User, Smile, Cat, Dog, Coffee, Heart, Zap, Briefcase, Calendar, CheckSquare, Compass, CreditCard, DollarSign, FileText, Gift, Grid, Layout, List, Map, MessageCircle, Moon, Music, Package, PenTool, Phone, Play, Printer, Search, Star, Sun, Truck, Video, Camera, Image as ImageIcon, File, LogOut, PieChart, ShoppingCart, PiggyBank, Shield, Target, Coins, Plane, Folder, Sparkles, Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';

// Expand icons so user has many choices for pages
export const AVAILABLE_ICONS: Record<string, React.ReactNode> = {
  Activity: <Activity size={24} />,
  Wallet: <Wallet size={24} />,
  PiggyBank: <PiggyBank size={24} />,
  Shield: <Shield size={24} />,
  Target: <Target size={24} />,
  Coins: <Coins size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Plane: <Plane size={24} />,
  Sparkles: <Sparkles size={24} />,
  Folder: <Folder size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  User: <User size={24} />,
  Smile: <Smile size={24} />,
  Cat: <Cat size={24} />,
  Dog: <Dog size={24} />,
  Coffee: <Coffee size={24} />,
  Heart: <Heart size={24} />,
  Zap: <Zap size={24} />,
  Briefcase: <Briefcase size={24} />,
  Calendar: <Calendar size={24} />,
  CheckSquare: <CheckSquare size={24} />,
  Compass: <Compass size={24} />,
  CreditCard: <CreditCard size={24} />,
  DollarSign: <DollarSign size={24} />,
  FileText: <FileText size={24} />,
  Gift: <Gift size={24} />,
  Grid: <Grid size={24} />,
  Layout: <Layout size={24} />,
  List: <List size={24} />,
  Map: <Map size={24} />,
  MessageCircle: <MessageCircle size={24} />,
  Moon: <Moon size={24} />,
  Music: <Music size={24} />,
  Package: <Package size={24} />,
  PenTool: <PenTool size={24} />,
  Phone: <Phone size={24} />,
  Play: <Play size={24} />,
  Printer: <Printer size={24} />,
  Search: <Search size={24} />,
  Star: <Star size={24} />,
  Sun: <Sun size={24} />,
  Truck: <Truck size={24} />,
  Video: <Video size={24} />,
  Camera: <Camera size={24} />,
  Image: <ImageIcon size={24} />,
  File: <File size={24} />,
  PieChart: <PieChart size={24} />
};

export default function Sidebar() {
  const pathname = usePathname();
  const { userName, userIcon, pages, theme, toggleTheme, setIsAppLocked, openTxModal } = useUser();

  const leftPages = pages.slice(0, 2);
  const rightPages = pages.slice(2, 4);

  const renderNavLink = (link: typeof pages[0]) => {
    const isActive = pathname === link.path;
    const IconComp = AVAILABLE_ICONS[link.icon] || <File size={22} />;
    
    return (
      <Link 
        key={link.id} 
        href={link.path}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all flex-1 ${
          isActive ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary'
        }`}
      >
        <div className={isActive ? "scale-110 transition-transform text-primary" : "transition-transform"}>
          {React.cloneElement(IconComp as React.ReactElement, { size: 20 })}
        </div>
        <span className={`text-[9px] font-bold text-center leading-tight mt-0.5 truncate max-w-[64px] ${isActive ? 'text-primary' : 'text-gray-400'}`}>
          {link.name}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-20 md:w-24 hidden md:flex flex-col items-center py-6 bg-[var(--surface)] border-r border-[var(--border)] z-10 shrink-0 h-full transition-colors duration-300">
        <Link href="/" className="w-12 h-12 bg-gradient-to-br from-primary to-accent hover:opacity-90 rounded-2xl flex items-center justify-center text-white mb-8 shadow-md shadow-primary/20 transition-all cursor-pointer">
        <Home size={24} />
      </Link>
      
      <nav className="flex flex-col gap-6 text-gray-400 flex-1 w-full px-4 items-center">
        {pages.map((link) => {
          const isActive = pathname === link.path;
          const IconComp = AVAILABLE_ICONS[link.icon] || <File size={24} />;
          
          return (
            <Link 
              key={link.id} 
              href={link.path}
              className={`p-3 rounded-2xl transition-all w-full flex flex-col items-center gap-1.5 ${
                isActive ? 'text-primary bg-primary/10 dark:bg-primary/25 shadow-xs ring-1 ring-primary/25 font-bold' : 'hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15'
              }`}
              title={link.name}
            >
              <div className={isActive ? "scale-110 transition-transform" : "transition-transform"}>
                {IconComp}
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight w-full ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Profile */}
      <div className="flex flex-col items-center gap-6 w-full">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-xl transition-colors text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <Link 
          href="/settings"
          className={`p-3 rounded-xl transition-colors ${
            pathname === '/settings' ? 'text-primary bg-primary/10 dark:bg-primary/25' : 'text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15'
          }`}
          title="Settings"
        >
          <Settings size={24} />
        </Link>

        <button 
          onClick={() => setIsAppLocked(true)}
          className="p-3 rounded-xl transition-colors text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Keluar / Kunci Aplikasi"
        >
          <LogOut size={24} />
        </button>
        
        <div className="flex flex-col items-center gap-2 pt-6 border-t border-[var(--border)] w-full px-2" title={userName}>
          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-xs border border-primary/20 overflow-hidden">
            {AVAILABLE_ICONS[userIcon] || <User size={20} />}
          </div>
          <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center px-1">{userName}</span>
        </div>
      </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--surface)] border-b border-[var(--border)] flex justify-between items-center px-4 z-50 shadow-xs">
        <div className="flex items-center gap-2 text-primary font-bold">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent text-white rounded-lg flex items-center justify-center shadow-xs">
            <Home size={18} />
          </div>
          <span>Rumah Kita</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <Link 
            href="/settings" 
            className={`p-2 rounded-xl transition-colors ${pathname === '/settings' ? 'text-primary bg-primary/10 dark:bg-primary/25' : 'hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15'}`} 
            title="Pengaturan"
          >
            <Settings size={20} />
          </Link>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl transition-colors hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15" 
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsAppLocked(true)} 
            className="p-2 rounded-xl transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
            title="Kunci Aplikasi"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation with Center FAB */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none">
        <div className="relative w-full h-[62px] flex items-stretch pointer-events-auto">
          {/* Left Wing */}
          <div className="flex-1 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-around px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            {leftPages.map(renderNavLink)}
          </div>

          {/* Center Scooped Notch & FAB */}
          <div className="relative w-[96px] h-full shrink-0 flex items-center justify-center">
            {/* Notch Cutout Graphic */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              <svg 
                viewBox="0 0 96 32" 
                className="w-[96px] h-[32px] block shrink-0" 
                preserveAspectRatio="none"
              >
                {/* Background fill */}
                <path 
                  d="M 0 0 C 20 0, 24 28, 48 28 C 72 28, 76 0, 96 0 L 96 32 L 0 32 Z" 
                  fill="var(--surface)" 
                />
                {/* Border line */}
                <path 
                  d="M 0 0.5 C 20 0.5, 24 28, 48 28 C 72 28, 76 0.5, 96 0.5" 
                  fill="none" 
                  stroke="var(--border)" 
                  strokeWidth="1" 
                />
              </svg>
              {/* Lower fill below notch */}
              <div className="flex-1 bg-[var(--surface)] w-full" />
            </div>

            {/* Elevated Circular FAB Button */}
            <button
              onClick={openTxModal}
              className="relative -top-4 w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-primary to-[#856cae] text-white flex items-center justify-center shadow-lg shadow-primary/35 border-4 border-[var(--surface)] transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
              title="Input Transaksi"
              aria-label="Input Transaksi"
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right Wing */}
          <div className="flex-1 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-around px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            {rightPages.map(renderNavLink)}
          </div>
        </div>

        {/* iPhone Safe Area padding */}
        <div className="h-[env(safe-area-inset-bottom,0px)] bg-[var(--surface)] pointer-events-auto" />
      </nav>
    </>
  );
}
