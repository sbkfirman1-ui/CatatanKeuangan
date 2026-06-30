'use client';
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, PageMeta, DashboardLabels } from '@/context/UserContext';
import { AVAILABLE_ICONS } from '@/components/Sidebar';

export default function SettingsPage() {
  const { userName, setUserName, userIcon, setUserIcon, pages, setPages, dashboardLabels, setDashboardLabels } = useUser();
  
  const [localName, setLocalName] = useState(userName);
  const [localIcon, setLocalIcon] = useState(userIcon);
  const [localPages, setLocalPages] = useState<PageMeta[]>(pages);
  const [localDashboardLabels, setLocalDashboardLabels] = useState<DashboardLabels>(dashboardLabels);
  
  const [isSaved, setIsSaved] = useState(false);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  const handleSave = () => {
    setUserName(localName);
    setUserIcon(localIcon);
    localStorage.setItem('userName', localName);
    localStorage.setItem('userIcon', localIcon);
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

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto pb-12">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400">
            <SettingsIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white tracking-tight">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Customize your app pages and profile</p>
          </div>
        </div>
        
        {/* Save Button moved to Top Right */}
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${
            isSaved ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-orange-600 text-white'
          }`}
        >
          {isSaved ? <Check size={20} /> : <Save size={20} />}
          <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </header>

      <div className="flex flex-col gap-6">
        
        {/* Page Customization Section */}
        <div className="bento-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-secondary mb-1">Page Customization</h2>
          <p className="text-sm text-gray-400 mb-6">Change the names and icons of your main app pages.</p>
          
          <div className="flex flex-col gap-4">
            {localPages.map((page, index) => (
              <div key={page.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-800/50">
                <button 
                  onClick={() => setExpandedPageId(expandedPageId === page.id ? null : page.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-primary rounded-xl">
                      {AVAILABLE_ICONS[page.icon]}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Page {index + 1}</p>
                      <p className="font-bold text-secondary dark:text-white">{page.name}</p>
                    </div>
                  </div>
                  {expandedPageId === page.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </button>
                
                <AnimatePresence>
                  {expandedPageId === page.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 p-4 flex flex-col gap-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">PAGE NAME</label>
                        <input 
                          type="text" 
                          value={page.name}
                          onChange={(e) => updatePage(page.id, 'name', e.target.value)}
                          className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 shadow-inner outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-primary transition-all text-secondary dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">PAGE ICON</label>
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-700">
                          {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                            <button
                              key={iconName}
                              onClick={() => updatePage(page.id, 'icon', iconName)}
                              className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                                page.icon === iconName 
                                ? 'bg-primary text-white shadow-md scale-105' 
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

        {/* Dashboard Content Labels Section */}
        <div className="bento-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-secondary mb-1">Dashboard Labels</h2>
            <p className="text-sm text-gray-400 mb-6">Customize the text displayed inside the Dashboard (Page 1).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Total Balance Label</label>
              <input 
                type="text" 
                value={localDashboardLabels.totalBalance}
                onChange={(e) => updateLabel('totalBalance', e.target.value)}
                className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Income Label</label>
              <input 
                type="text" 
                value={localDashboardLabels.income}
                onChange={(e) => updateLabel('income', e.target.value)}
                className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Expense Label</label>
              <input 
                type="text" 
                value={localDashboardLabels.expense}
                onChange={(e) => updateLabel('expense', e.target.value)}
                className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Chart Title (P&L)</label>
              <input 
                type="text" 
                value={localDashboardLabels.profitAndLoss}
                onChange={(e) => updateLabel('profitAndLoss', e.target.value)}
                className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Recent Activity Label</label>
              <input 
                type="text" 
                value={localDashboardLabels.recent}
                onChange={(e) => updateLabel('recent', e.target.value)}
                className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Analytics Label</label>
              <input 
                type="text" 
                value={localDashboardLabels.analytics}
                onChange={(e) => updateLabel('analytics', e.target.value)}
                className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
              />
            </div>
          </div>
        </div>

        {/* Profile Customization Section */}
        <div className="bento-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-secondary mb-1">Profile Name</h2>
            <p className="text-sm text-gray-400 mb-4">How you want to be called in the app.</p>
            <input 
              type="text" 
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Your Name"
              className="w-full border-none rounded-xl px-4 py-3 bg-gray-50 shadow-inner outline-none ring-1 ring-gray-200 focus:ring-primary transition-all text-secondary font-medium"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-secondary mb-1">Profile Icon</h2>
            <p className="text-sm text-gray-400 mb-4">Select an avatar for your sidebar profile.</p>
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2 h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl ring-1 ring-gray-200">
              {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => setLocalIcon(iconName)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    localIcon === iconName 
                    ? 'bg-primary text-white shadow-md scale-105' 
                    : 'text-gray-400 hover:bg-gray-200 hover:text-secondary'
                  }`}
                >
                  {React.cloneElement(AVAILABLE_ICONS[iconName] as React.ReactElement, { size: 18 })}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
