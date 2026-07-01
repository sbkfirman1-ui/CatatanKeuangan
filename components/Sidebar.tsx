'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Activity, TrendingUp, Settings, User, Smile, Cat, Dog, Coffee, Heart, Zap, Briefcase, Calendar, CheckSquare, Compass, CreditCard, DollarSign, FileText, Gift, Grid, Layout, List, Map, MessageCircle, Moon, Music, Package, PenTool, Phone, Play, Printer, Search, Star, Sun, Truck, Video, Camera, Image as ImageIcon, File, LogOut, PieChart, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@/context/UserContext';

// Expand icons so user has many choices for pages
export const AVAILABLE_ICONS: Record<string, React.ReactNode> = {
  Activity: <Activity size={24} />,
  Wallet: <Wallet size={24} />,
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
  const { userName, userIcon, pages, theme, toggleTheme, setIsAppLocked, isBalanceHidden, toggleBalanceVisibility } = useUser();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-20 md:w-24 hidden md:flex flex-col items-center py-6 bg-[var(--surface)] border-r border-gray-100 dark:border-gray-800 z-10 shrink-0 h-full transition-colors duration-300">
        <Link href="/" className="w-12 h-12 bg-primary hover:bg-orange-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-sm transition-colors cursor-pointer">
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
              className={`p-3 rounded-xl transition-all w-full flex flex-col items-center gap-1.5 ${
                isActive ? 'text-primary bg-orange-50 dark:bg-orange-900/20 shadow-sm ring-1 ring-orange-100 dark:ring-orange-900/50' : 'hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
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
          onClick={toggleBalanceVisibility}
          className="p-3 rounded-xl transition-colors text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
          title="Sembunyikan Saldo"
        >
          {isBalanceHidden ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>

        <button 
          onClick={toggleTheme}
          className="p-3 rounded-xl transition-colors text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <Link 
          href="/settings"
          className={`p-3 rounded-xl transition-colors ${
            pathname === '/settings' ? 'text-primary bg-orange-50 dark:bg-orange-900/20' : 'text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
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
        
        <div className="flex flex-col items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800 w-full px-2" title={userName}>
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {AVAILABLE_ICONS[userIcon] || <User size={20} />}
          </div>
          <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center px-1">{userName}</span>
        </div>
      </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center px-4 z-50 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold">
          <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
            <Home size={18} />
          </div>
          <span>Rumah Kita</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button onClick={toggleBalanceVisibility} className="hover:text-primary transition-colors" title="Sembunyikan Saldo">
            {isBalanceHidden ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          <button onClick={toggleTheme} className="hover:text-primary transition-colors" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button onClick={() => setIsAppLocked(true)} className="hover:text-red-500 transition-colors" title="Kunci Aplikasi">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-2 py-3 z-50 safe-area-pb">
        {pages.map((link) => {
          const isActive = pathname === link.path;
          const IconComp = AVAILABLE_ICONS[link.icon] || <File size={24} />;
          
          return (
            <Link 
              key={link.id} 
              href={link.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
            >
              <div className={isActive ? "scale-110 transition-transform" : "transition-transform"}>
                {React.cloneElement(IconComp as React.ReactElement, { size: 20 })}
              </div>
              <span className="text-[9px] font-bold text-center leading-tight">
                {link.name}
              </span>
            </Link>
          );
        })}
        
        {/* Settings Button on Mobile */}
        <Link 
          href="/settings"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            pathname === '/settings' ? 'text-primary' : 'text-gray-400 hover:text-primary'
          }`}
        >
          <Settings size={20} />
          <span className="text-[9px] font-bold text-center leading-tight">Pengaturan</span>
        </Link>
      </nav>
    </>
  );
}
