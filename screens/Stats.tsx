import React, { useState, useMemo } from 'react';
import { Session } from '../types';

interface StatsProps {
  sessions: Session[];
  costPerGram: number;
}

const TABS = ['Day', 'Week', 'Month', 'All'];

// Helper for Method Emojis
const getMethodEmoji = (method: string) => {
  switch (method) {
    case 'Joint': return '🚬';
    case 'Bong': return '⚗️';
    case 'Vape': return '💨';
    case 'Edible': return '🍪';
    default: return '🔥';
  }
};

export const Stats: React.FC<StatsProps> = ({ sessions, costPerGram }) => {
  const [activeTab, setActiveTab] = useState('Week');

  const { chartData, summary, methodCounts, strainStats } = useMemo(() => {
    const now = new Date();
    let filtered: Session[] = [];
    let data: { name: string; count: number; label?: string }[] = [];
    let periodLabel = "Sessions per day";

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    // --- Filter Logic (Standard) ---
    if (activeTab === 'Day') {
      periodLabel = "Today's Activity";
      const todayStart = startOfDay(now);
      filtered = sessions.filter(s => new Date(s.timestamp) >= todayStart);
      const blocks = ['Late', 'Early', 'Morn', 'Aft', 'Eve', 'Night'];
      const counts = [0,0,0,0,0,0];
      filtered.forEach(s => {
        const h = new Date(s.timestamp).getHours();
        const idx = Math.floor(h / 4);
        if (idx >= 0 && idx < 6) counts[idx]++;
      });
      data = blocks.map((name, i) => ({ name, count: counts[i] }));

    } else if (activeTab === 'Week') {
      periodLabel = "Last 7 Days";
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0,0,0,0);
      filtered = sessions.filter(s => new Date(s.timestamp) >= start);
      for(let i=0; i<7; i++) {
         const d = new Date(start);
         d.setDate(d.getDate() + i);
         const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
         const dayCount = filtered.filter(s => {
           const sd = new Date(s.timestamp);
           return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth();
         }).length;
         data.push({ name: dayName, count: dayCount });
      }

    } else if (activeTab === 'Month') {
      periodLabel = "This Month";
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = sessions.filter(s => new Date(s.timestamp) >= startOfMonth);
      const weeks = [0,0,0,0,0];
      filtered.forEach(s => {
         const date = new Date(s.timestamp).getDate();
         const weekIdx = Math.floor((date - 1) / 7);
         if(weeks[weekIdx] !== undefined) weeks[weekIdx]++;
      });
      data = ['W1', 'W2', 'W3', 'W4', 'W5'].map((n, i) => ({ name: n, count: weeks[i] }));

    } else { 
       periodLabel = "Monthly History";
       for(let i=5; i>=0; i--) {
         const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
         const mName = d.toLocaleDateString('en-US', { month: 'short' });
         const count = sessions.filter(s => {
           const sd = new Date(s.timestamp);
           return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
         }).length;
         data.push({ name: mName, count });
       }
       filtered = sessions; 
    }

    // --- Metrics ---
    const totalSessions = filtered.length;
    let totalGrams = 0;
    const totalSpent = filtered.reduce((acc, curr) => {
      let grams = parseFloat(curr.amount);
      if (isNaN(grams)) grams = 0.5;
      totalGrams += grams;
      if (curr.cost !== undefined && curr.cost !== 0) return acc + curr.cost;
      return acc + (grams * costPerGram);
    }, 0);
    
    let daysDivisor = 1;
    if (activeTab === 'Week') daysDivisor = 7;
    if (activeTab === 'Month') daysDivisor = new Date().getDate();
    if (activeTab === 'All') daysDivisor = 30 * 6;
    const avgPerDay = totalSessions > 0 ? (totalSessions / daysDivisor).toFixed(1) : "0";

    let maxInDay = 0;
    if (activeTab === 'Day') maxInDay = totalSessions;
    else {
      const dailyCounts: Record<string, number> = {};
      filtered.forEach(s => {
         const k = new Date(s.timestamp).toDateString();
         dailyCounts[k] = (dailyCounts[k] || 0) + 1;
      });
      const values = Object.values(dailyCounts);
      maxInDay = values.length > 0 ? Math.max(...values) : 0;
    }

    // --- 1. Consumption Methods (With Emojis) ---
    const methodMap: Record<string, number> = {};
    filtered.forEach(s => {
        const m = s.method || 'Other';
        methodMap[m] = (methodMap[m] || 0) + 1;
    });
    const sortedMethods = Object.entries(methodMap).sort((a,b) => b[1] - a[1]);

    // --- 2. Strain Statistics (Fixed Logic) ---
    const strainMap: Record<string, number> = {};
    
    // We want to count ALL sessions for specific strains
    // But we might want to group "Quick Log" differently
    filtered.forEach(s => {
        let st = (s.strain || 'Unknown').trim();
        // Capitalize for consistency
        st = st.charAt(0).toUpperCase() + st.slice(1);
        
        if (st.length > 0) {
            strainMap[st] = (strainMap[st] || 0) + 1;
        }
    });

    const sortedStrains = Object.entries(strainMap).sort((a,b) => b[1] - a[1]);
    
    // Unique count excludes "Quick Log" or "Unknown" if you want strictly real strains
    const uniqueStrainsCount = Object.keys(strainMap).filter(s => s !== 'Quick Log' && s !== 'Unknown').length;

    return {
        chartData: data,
        summary: {
            totalSessions,
            totalSpent: totalSpent.toFixed(0),
            totalGrams: totalGrams.toFixed(1),
            avgPerDay,
            maxInDay,
            title: periodLabel
        },
        methodCounts: sortedMethods,
        strainStats: {
            list: sortedStrains,
            uniqueCount: uniqueStrainsCount
        }
    };
  }, [sessions, activeTab, costPerGram]);

  const maxChartValue = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 p-6 pt-8 overflow-y-auto transition-colors">
      <h1 className="text-2xl font-black text-munch-dark dark:text-white mb-6">Insights</h1>

      <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl flex mb-8 transition-colors">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab 
                ? 'bg-white dark:bg-gray-700 text-munch-dark dark:text-white shadow-sm scale-105' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm mb-6 transition-colors min-h-[220px] flex flex-col">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Activity</p>
            <h3 className="text-lg font-bold text-munch-dark dark:text-white">{summary.title}</h3>
          </div>
          <div className="text-2xl font-black text-munch-green">{summary.totalSessions} <span className="text-xs text-gray-400 font-normal">sess.</span></div>
        </div>
        <div className="flex-1 flex items-end gap-2 w-full h-32">
          {chartData.map((item, index) => {
            const heightPct = (item.count / maxChartValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="w-full max-w-[18px] sm:max-w-[32px] h-full flex items-end bg-gray-100 dark:bg-gray-700/30 rounded-t-lg overflow-hidden">
                   <div style={{ height: `${heightPct}%` }} className={`w-full rounded-t-lg transition-all duration-700 ease-out ${item.count > 0 ? 'bg-munch-green' : 'bg-transparent'}`} />
                </div>
                <div className="mt-2 text-[8px] font-bold text-gray-400 dark:text-gray-500 truncate w-full text-center">{item.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm transition-colors">
          <div className="text-2xl font-black text-munch-dark dark:text-white">{summary.avgPerDay}</div>
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500">Avg. / Day</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm transition-colors">
          <div className="text-2xl font-black text-munch-dark dark:text-white">{summary.maxInDay}</div>
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500">Busiest Day</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm transition-colors">
           <div className="text-2xl font-black text-munch-dark dark:text-white">{summary.totalGrams}g</div>
           <div className="text-xs font-bold text-gray-400 dark:text-gray-500">Consumed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm transition-colors">
          <div className="text-2xl font-black text-munch-dark dark:text-white">${summary.totalSpent}</div>
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500">Est. Cost</div>
        </div>
      </div>

      {/* Methods */}
      <div className="mb-8">
        <h3 className="px-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-wider">Top Methods</h3>
        <div className="space-y-3">
            {methodCounts.length > 0 ? (
                methodCounts.map(([method, count]) => (
                    <div key={method} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center text-lg">
                                {/* ⭐ FIXED: Now uses Emojis */}
                                {getMethodEmoji(method)}
                            </div>
                            <span className="font-bold text-munch-dark dark:text-white">{method}</span>
                        </div>
                        <span className="text-sm font-black text-gray-400">{count}x</span>
                    </div>
                ))
            ) : (
                <div className="text-center p-4 text-gray-400 text-sm">No methods logged yet</div>
            )}
        </div>
      </div>

      {/* Strains */}
      <div className="mb-24">
        <div className="flex justify-between items-end px-2 mb-3">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Strains ({strainStats.uniqueCount})
            </h3>
        </div>
        
        <div className="space-y-3">
            {strainStats.list.length > 0 ? (
                strainStats.list.map(([strain, count]) => (
                    <div key={strain} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center text-sm">
                                🌿
                            </div>
                            <span className="font-bold text-munch-dark dark:text-white uppercase truncate max-w-[150px]">{strain}</span>
                        </div>
                        <span className="text-sm font-black text-gray-400">{count} sess.</span>
                    </div>
                ))
            ) : (
                <div className="text-center p-4 text-gray-400 text-sm">No strains recorded</div>
            )}
        </div>
      </div>
    </div>
  );
};