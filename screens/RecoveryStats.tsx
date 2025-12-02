import React, { useMemo } from 'react';
import { Session } from '../types';
import { Heart, Brain, Wind, TrendingUp, AlertTriangle, Check } from 'lucide-react';

interface RecoveryStatsProps {
  sessions: Session[];
  costPerGram: number;
}

export const RecoveryStats: React.FC<RecoveryStatsProps> = ({ sessions, costPerGram }) => {
  
  const stats = useMemo(() => {
    const now = new Date();
    
    // 1. Time Sober
    let lastSession = null;
    if (sessions.length > 0) {
        const sorted = [...sessions].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        lastSession = new Date(sorted[0].timestamp);
    }
    
    let daysSober = 0;
    let hoursSober = 0;
    
    if (lastSession) {
        const diff = now.getTime() - lastSession.getTime();
        daysSober = Math.floor(diff / (1000 * 60 * 60 * 24));
        hoursSober = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }

    // 2. Lifetime Spend (The "Shock" Factor)
    const lifetimeSpend = sessions.reduce((acc, curr) => {
        if (curr.cost) return acc + curr.cost;
        let grams = parseFloat(curr.amount) || 0.5;
        return acc + (grams * costPerGram);
    }, 0);

    // 3. Projected Savings (Annual)
    // Calculate avg daily spend over the last 30 active days (or less)
    // Simply: Lifetime spend / (days since first log to last log) * 365
    // For simplicity: Use lifetime avg.
    let projectedAnnualSavings = 0;
    if (sessions.length > 1) {
        const first = new Date(sessions[sessions.length-1].timestamp);
        const last = new Date(sessions[0].timestamp);
        const activeDays = Math.max(1, (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
        const dailyAvg = lifetimeSpend / activeDays;
        projectedAnnualSavings = dailyAvg * 365;
    } else if (sessions.length === 1) {
        // Fallback for only 1 log
        projectedAnnualSavings = lifetimeSpend * 52; // Assume weekly
    }

    return { daysSober, hoursSober, lifetimeSpend, projectedAnnualSavings };
  }, [sessions, costPerGram]);

  // Health Timeline Data
  const healthMilestones = [
    { time: '20 mins', benefit: 'Heart rate drops to normal', icon: Heart, achieved: true },
    { time: '24 hours', benefit: 'Carbon monoxide cleared from blood', icon: Wind, achieved: stats.daysSober >= 1 },
    { time: '48 hours', benefit: 'Taste and smell improve', icon: Brain, achieved: stats.daysSober >= 2 },
    { time: '72 hours', benefit: 'Bronchial tubes relax, energy increases', icon: Wind, achieved: stats.daysSober >= 3 },
    { time: '2 weeks', benefit: 'Circulation improves significantly', icon: Heart, achieved: stats.daysSober >= 14 },
    { time: '1 month', benefit: 'Coughing and shortness of breath decrease', icon: Wind, achieved: stats.daysSober >= 30 },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 p-6 pt-8 overflow-y-auto transition-colors">
      <h1 className="text-2xl font-black text-red-500 mb-2">Recovery Mode</h1>
      <p className="text-gray-500 text-sm mb-6">Tracking your journey to freedom.</p>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border-l-4 border-green-500">
           <div className="text-3xl font-black text-gray-900 dark:text-white">
             {stats.daysSober}<span className="text-sm text-gray-400 font-bold ml-1">d</span> {stats.hoursSober}<span className="text-sm text-gray-400 font-bold ml-1">h</span>
           </div>
           <div className="text-xs font-bold text-gray-400 uppercase mt-1">Time Sober</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border-l-4 border-blue-500">
           <div className="text-3xl font-black text-gray-900 dark:text-white">
             ${stats.projectedAnnualSavings.toFixed(0)}
           </div>
           <div className="text-xs font-bold text-gray-400 uppercase mt-1">Yearly Savings</div>
        </div>
      </div>

      {/* The "Shock" Card */}
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl mb-8 flex items-center justify-between border border-red-100 dark:border-red-900/30">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={18} className="text-red-500" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Lifetime Cost</span>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
                -${stats.lifetimeSpend.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total money spent on weed.</p>
        </div>
      </div>

      {/* Health Timeline */}
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-4 tracking-wider px-2">Health Timeline</h3>
      <div className="space-y-4 mb-24">
        {healthMilestones.map((item, i) => (
            <div key={i} className={`flex gap-4 items-start p-4 rounded-2xl border transition-all ${item.achieved ? 'bg-white dark:bg-gray-800 border-green-500/30' : 'bg-gray-100 dark:bg-gray-800/50 border-transparent opacity-50'}`}>
                <div className={`p-2 rounded-full ${item.achieved ? 'bg-green-100 text-green-600' : 'bg-gray-300 text-gray-500'}`}>
                    <item.icon size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.time}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.benefit}</p>
                </div>
                {item.achieved && (
                    <div className="ml-auto text-green-500">
                        <Check size={20} />
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};