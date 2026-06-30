'use client';
import React, { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

export default function StatementPage() {
  const { transactions } = useUser();

  const { totalIncome, totalExpense, expensePercentage, remainingBalance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else if (t.type === 'expense') exp += Math.abs(t.amount);
    });

    const percentage = inc > 0 ? Math.min(Math.round((exp / inc) * 100), 100) : (exp > 0 ? 100 : 0);
    const balance = inc - exp;

    return { totalIncome: inc, totalExpense: exp, expensePercentage: percentage, remainingBalance: balance };
  }, [transactions]);

  const pieData = [
    { name: 'Pemasukan Terpakai', value: totalExpense, color: '#f97316' }, // orange-500
    { name: 'Sisa Saldo', value: Math.max(totalIncome - totalExpense, 0), color: '#22c55e' } // green-500
  ];

  // If expense is greater than income, we show a different pie
  const overspendData = [
    { name: 'Pemasukan', value: totalIncome, color: '#22c55e' },
    { name: 'Defisit (Overspend)', value: totalExpense - totalIncome, color: '#ef4444' } // red-500
  ];

  const chartData = totalExpense > totalIncome ? overspendData : pieData;

  return (
    <div className="flex flex-col h-full pb-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-secondary tracking-tight">Financial Statement</h1>
        <p className="text-gray-500">Ringkasan kondisi keuangan Anda</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Income Card */}
        <div className="bento-card p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={80} />
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 mb-1">TOTAL PEMASUKAN</p>
            <h2 className="text-2xl font-black text-secondary">
              Rp {totalIncome.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bento-card p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown size={80} />
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 mb-1">TOTAL PENGELUARAN</p>
            <h2 className="text-2xl font-black text-secondary">
              Rp {totalExpense.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>

        {/* Expense Percentage Card */}
        <div className="bento-card p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={80} />
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expensePercentage >= 80 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            {expensePercentage >= 80 ? <AlertCircle size={24} /> : <Activity size={24} />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 mb-1">RASIO PENGELUARAN</p>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-2xl font-black ${expensePercentage >= 80 ? 'text-red-500' : 'text-secondary'}`}>
                {expensePercentage}%
              </h2>
              <span className="text-sm font-medium text-gray-500">dari Pemasukan</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${expensePercentage >= 80 ? 'bg-red-500' : 'bg-primary'}`} 
                style={{ width: `${Math.min(expensePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* Chart Section */}
        <div className="bento-card p-6 flex flex-col">
          <h3 className="font-bold text-secondary mb-6 text-lg">Komposisi Keuangan</h3>
          
          {totalIncome === 0 && totalExpense === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Belum ada data transaksi
            </div>
          ) : (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status / Insight Section */}
        <div className="bento-card p-6 flex flex-col gap-6">
          <h3 className="font-bold text-secondary text-lg">Kesimpulan</h3>
          
          <div className={`p-5 rounded-2xl border ${remainingBalance >= 0 ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
            <h4 className={`text-sm font-bold mb-2 ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              STATUS SALDO ANDA
            </h4>
            <p className="text-secondary text-base leading-relaxed">
              {remainingBalance > 0 ? (
                <>Anda memiliki surplus (sisa saldo) sebesar <b>Rp {remainingBalance.toLocaleString('id-ID')}</b>. Kondisi keuangan Anda terpantau sehat dan aman!</>
              ) : remainingBalance === 0 ? (
                <>Saldo Anda saat ini adalah <b>Rp 0</b>. Anda menghabiskan tepat sejumlah yang Anda hasilkan.</>
              ) : (
                <>Anda mengalami defisit keuangan sebesar <b className="text-red-500">Rp {Math.abs(remainingBalance).toLocaleString('id-ID')}</b>. Pengeluaran Anda lebih besar daripada pemasukan!</>
              )}
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-gray-50/50 border-gray-100">
             <h4 className="text-sm font-bold mb-2 text-gray-500">
              SARAN KEUANGAN
            </h4>
            <p className="text-secondary text-base leading-relaxed">
              {expensePercentage < 50 ? (
                "Luar biasa! Anda berhasil menabung lebih dari 50% dari pendapatan Anda. Terus pertahankan pola hidup hemat ini dan pertimbangkan untuk berinvestasi."
              ) : expensePercentage <= 80 ? (
                "Rasio pengeluaran Anda masih dalam batas wajar. Anda bisa mencoba mengurangi pengeluaran tersier (hiburan) untuk menambah porsi tabungan."
              ) : (
                "Rasio pengeluaran Anda sangat tinggi (mendekati atau melebihi pemasukan). Segera evaluasi ulang anggaran bulanan Anda dan kurangi pengeluaran yang tidak penting."
              )}
            </p>
          </div>
          
        </div>

      </div>
    </div>
  );
}
