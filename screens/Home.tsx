import React, { useState, useEffect, useRef } from 'react';
import { Session } from '../types';
import { LogModal } from '../components/LogModal';
import { Flame, Clock, RotateCcw } from 'lucide-react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import smokeAnimation from '../assets/smoke.json'; 

// IMAGE PATHS
const IMG_LEVEL_1 = "/mascot-level-1.png"; 
const IMG_LEVEL_2 = "/mascot-level-2.png"; 
const IMG_LEVEL_3 = "/mascot-level-3.png"; 

// T-Break Quotes
const BREAK_QUOTES = [
  "Your tolerance is resetting...",
  "Think of the cash you're saving!",
  "Clear head, vivid dreams.",
  "You're doing great, friend.",
  "Stay strong, it's worth it.",
  "Resetting the system..."
];

const RECOVERY_QUOTES = [
  "One day at a time.",
  "Freedom feels good.",
  "You are stronger than the urge.",
  "Building a better life, daily.",
  "Proud of your progress.",
  "Keep going, you're doing amazing."
];

interface HomeProps {
  sessions: Session[];
  onLogSession: (session: Partial<Session>) => void;
  onUndo: () => void;
  dailyGoal: number;
  weeklyGoal: number;
  goalPeriod: 'day' | 'week';
  costPerGram: number;
  tBreakTarget: string | null; 
  isQuitting: boolean; // 🆕 Added Prop
}

export const Home: React.FC<HomeProps> = ({ 
  sessions, onLogSession, onUndo, dailyGoal, weeklyGoal, goalPeriod, costPerGram, tBreakTarget, isQuitting
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentCount, setCurrentCount] = useState(0); 
  const [streak, setStreak] = useState(0);
  const [lastSessionTime, setLastSessionTime] = useState<string | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  
  // Animation State
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [showSmoke, setShowSmoke] = useState(false);

  // Long Press Refs
  const longPressTimer = useRef<any>(null);
  const isLongPress = useRef(false);

  // Time States
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, mins: number} | null>(null);
  const [soberTime, setSoberTime] = useState<{days: number, hours: number} | null>(null);

  const activeGoal = goalPeriod === 'day' ? dailyGoal : weeklyGoal;

  useEffect(() => {
    const now = new Date();
    const todayString = now.toDateString();
    
    // T-Break Calculation
    if (tBreakTarget) {
        const target = new Date(tBreakTarget);
        const diff = target.getTime() - now.getTime();
        if (diff > 0) {
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            });
        } else setTimeLeft(null);
    } else setTimeLeft(null);

    // Sober Time Calculation (for Quitting Mode)
    if (isQuitting && sessions.length > 0) {
        const sorted = [...sessions].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const last = new Date(sorted[0].timestamp);
        const diff = now.getTime() - last.getTime();
        setSoberTime({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        });
    } else if (isQuitting) {
        setSoberTime({ days: 0, hours: 0 }); // Fresh start
    }

    // Filter sessions
    let periodSessions: Session[] = [];
    if (goalPeriod === 'day') {
       periodSessions = sessions.filter(s => new Date(s.timestamp).toDateString() === todayString);
    } else {
       const oneWeekAgo = new Date();
       oneWeekAgo.setDate(now.getDate() - 6);
       oneWeekAgo.setHours(0,0,0,0);
       periodSessions = sessions.filter(s => new Date(s.timestamp) >= oneWeekAgo);
    }
    
    setCurrentCount(periodSessions.length);

    // Last session time
    if (sessions.length > 0) {
      const sorted = [...sessions].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const last = new Date(sorted[0].timestamp);
      const diffMins = Math.floor((now.getTime() - last.getTime()) / 60000);
      if (diffMins < 60) setLastSessionTime(`${diffMins}m ago`);
      else setLastSessionTime(`${Math.floor(diffMins/60)}h ago`);
    } else {
      setLastSessionTime(null);
    }

    if (sessions.length > 0) setStreak(5); 
  }, [sessions, goalPeriod, tBreakTarget, isQuitting]);

  const getMascotImage = () => {
    if (isQuitting) return IMG_LEVEL_1; // Always chill/happy for recovery
    if (tBreakTarget && timeLeft) return IMG_LEVEL_1; 
    if (currentCount === 0) return IMG_LEVEL_1;
    if (currentCount > activeGoal) return IMG_LEVEL_3;
    return IMG_LEVEL_2;
  };

  const getMascotMessage = () => {
    if (isQuitting) {
        const idx = new Date().getHours() % RECOVERY_QUOTES.length;
        return RECOVERY_QUOTES[idx];
    }
    if (tBreakTarget && timeLeft) {
        const idx = new Date().getHours() % BREAK_QUOTES.length;
        return BREAK_QUOTES[idx];
    }
    if (currentCount === 0) return `Ready to track this ${goalPeriod === 'week' ? 'week' : 'day'}?`;
    if (currentCount < activeGoal) return "You're chilling";
    if (currentCount === activeGoal) return "Limit reached. Take a breath of AIR?";
    return "Dude, I'm about to green out. STOP";
  };

  // --- TOUCH / LONG PRESS LOGIC ---
  const handlePressStart = () => {
    setIsPressing(true);
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsPressing(false); 
      setModalOpen(true); 
    }, 500); 
  };

  const handlePressEnd = (e: any) => {
    if (e && e.cancelable) e.preventDefault(); 
    
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    // Only quick log if NOT quitting (Quitting requires deliberate action via "Slip up" button)
    if (!isQuitting && isPressing && !isLongPress.current) {
        handleQuickLog();
    }
    setIsPressing(false);
  };

  const handleQuickLog = () => {
    setShowSmoke(true);
    if (lottieRef.current) {
        lottieRef.current.goToAndPlay(0);
    }
    setTimeout(() => setShowSmoke(false), 2000);

    const amountStr = '0.5g';
    const cost = 0.5 * costPerGram;
    onLogSession({ method: 'Joint', amount: amountStr, strain: 'Quick Log', cost: cost });
  };

  const handleSlipUp = () => {
      if (window.confirm("Log a slip up? This will reset your sobriety counter but keep your history.")) {
          handleQuickLog();
      }
  };

  const isOverLimit = currentCount > activeGoal;
  const isTBreakActive = !!(tBreakTarget && timeLeft);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pt-8 z-20">
        <div>
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {isQuitting ? 'Recovery Mode' : isTBreakActive ? 'T-Break Active' : (goalPeriod === 'week' ? 'Last 7 Days' : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }))}
          </h2>
          <h1 className="text-2xl font-black text-munch-dark dark:text-white">
            {isQuitting ? 'One Day at a Time' : isTBreakActive ? 'Stay Strong' : 'Hello, Friend'}
          </h1>
        </div>
        
        {/* Hide Streak/Time if Quitting (Replaced by main view) */}
        {!isQuitting && (
            <div className="flex gap-2">
            {lastSessionTime && (
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-1 border border-gray-200 dark:border-gray-700">
                <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="font-bold text-gray-600 dark:text-gray-300 text-xs">{lastSessionTime}</span>
                </div>
            )}
            <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full flex items-center gap-1 border border-orange-100 dark:border-orange-900/30">
                <Flame size={16} className="text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{streak}</span>
            </div>
            </div>
        )}
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        
        {/* Smoke Layer (Still kept for slip-ups) */}
        <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 ${showSmoke ? 'opacity-100' : 'opacity-0'}`} 
            style={{ zIndex: 50, width: '500px', height: '500px' }} 
        >
           <Lottie 
             lottieRef={lottieRef} 
             animationData={smokeAnimation} 
             loop={false} 
             autoplay={false} 
           />
        </div>

        <div className="relative grid place-items-center" style={{ width: '288px', height: '288px' }}>
          
          {/* Progress Ring */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-90 transition-transform duration-300" style={{ width: '256px', height: '256px', transform: `translate(-50%, -50%) rotate(-90deg) scale(${isPressing ? 0.95 : 1})` }}>
            <circle cx="128" cy="128" r={100} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-800" />
            <circle 
               cx="128" cy="128" r={100} stroke="currentColor" strokeWidth="6" fill="transparent" 
               // Blue for T-Break, Gold/Green for Recovery, Red for Over Limit
               className={`${isQuitting ? 'text-green-500' : isTBreakActive ? 'text-blue-400' : isOverLimit ? 'text-red-500' : 'text-munch-green'} transition-all duration-1000 ease-out`}
            />
          </svg>

          {/* Pulse/Glow */}
          <div 
             className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${isQuitting ? 'bg-green-50 dark:bg-green-900/10' : isTBreakActive ? 'bg-blue-50 dark:bg-blue-900/20' : isOverLimit ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}
             style={{ width: '208px', height: '208px' }}
          />

          {/* THE BUTTON (Non-interactive in Quit Mode unless specific logic added) */}
          <button
            // Disable main press logic if quitting (use Slip Up button instead)
            onMouseDown={!isQuitting ? handlePressStart : undefined}
            onMouseUp={!isQuitting ? handlePressEnd : undefined}
            onMouseLeave={!isQuitting ? handlePressEnd : undefined}
            onTouchStart={!isQuitting ? handlePressStart : undefined}
            onTouchEnd={!isQuitting ? handlePressEnd : undefined}
            onContextMenu={(e) => e.preventDefault()} 
            style={{ width: '160px', height: '160px' }}
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              rounded-full shadow-xl 
              ${isQuitting ? 'shadow-green-500/40 ring-4 ring-green-500 cursor-default' : isTBreakActive ? 'shadow-blue-400/40 ring-4 ring-blue-400' : isOverLimit ? 'shadow-red-500/40 ring-4 ring-red-500' : 'shadow-munch-green/40 ring-4 ring-munch-green'}
              border-4 border-white dark:border-gray-900 
              bg-gray-800 dark:bg-gray-900 
              z-20 overflow-hidden
              transition-all duration-200 ease-in-out
              ${isPressing ? 'scale-95' : 'scale-100 hover:scale-105'}
              touch-none select-none
            `}
          >
            <img 
              src={getMascotImage()} 
              alt="Mascot" 
              className="w-full h-full object-contain scale-[1.75] translate-y-2 drop-shadow-lg" 
            />
            {/* Hide "Tap to Log" text in Recovery Mode to reduce temptation */}
            {!isQuitting && (
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-8 flex flex-col items-center">
                <span className="text-[10px] font-black text-white tracking-widest uppercase opacity-90 drop-shadow-md">
                    {isTBreakActive ? (isPressing ? 'Slipping up?' : 'On Break') : (isPressing ? 'Inhaling...' : 'Tap or Hold')}
                </span>
                </div>
            )}
          </button>
        </div>

        {/* Undo Button (Only in consumption mode) */}
        {!isQuitting && !isTBreakActive && currentCount > 0 && (
          <button 
            onClick={onUndo}
            className="mt-4 mb-2 p-2 px-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <RotateCcw size={14} />
            <span>Undo</span>
          </button>
        )}

        {/* MAIN TEXT DISPLAY */}
        <div className="w-full px-6 mt-4 text-center h-[90px] flex items-center justify-center flex-col">
          {isQuitting && soberTime ? (
             <div className="animate-fade-in w-full">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sober Streak</p>
                <div className="flex justify-center gap-4 mb-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl min-w-[80px]">
                        <span className="block text-3xl font-black text-green-600 dark:text-green-400">{soberTime.days}</span>
                        <span className="text-[10px] font-bold text-green-700/60 dark:text-green-400/60 uppercase">Days</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl min-w-[80px]">
                        <span className="block text-3xl font-black text-green-600 dark:text-green-400">{soberTime.hours}</span>
                        <span className="text-[10px] font-bold text-green-700/60 dark:text-green-400/60 uppercase">Hrs</span>
                    </div>
                </div>
                {/* Slip Up Button */}
                <button onClick={handleSlipUp} className="text-xs font-bold text-red-400 hover:text-red-500 flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    {/* Note: AlertCircle icon requires import but ShieldCheck is available from lucide-react in current imports if preferred */}
                    I slipped up
                </button>
             </div>
          ) : isTBreakActive && timeLeft ? (
             <div className="animate-fade-in w-full">
                <div className="flex justify-center gap-4 mb-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl min-w-[70px]">
                        <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft.days}</span>
                        <span className="text-[10px] font-bold text-blue-400/80 uppercase">Days</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl min-w-[70px]">
                        <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft.hours}</span>
                        <span className="text-[10px] font-bold text-blue-400/80 uppercase">Hrs</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl min-w-[70px]">
                        <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft.mins}</span>
                        <span className="text-[10px] font-bold text-blue-400/80 uppercase">Mins</span>
                    </div>
                </div>
             </div>
          ) : (
            // Default Tracking Display - Just the main count
            <div>
              <h3 className="text-4xl font-black text-munch-dark dark:text-white transition-all">
                {currentCount} <span className="text-lg text-gray-400 font-bold">/ {activeGoal}</span>
              </h3>
              <p className="text-munch-med dark:text-gray-400 font-medium text-sm mt-1">
                 Sessions {goalPeriod === 'day' ? 'Today' : 'This Week'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Coach Message */}
      <div className="p-6 pb-8 flex flex-col items-center gap-3">
        <div className="bg-munch-light dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-green-100 dark:border-gray-700">
          <p className="text-munch-dark dark:text-gray-300 font-medium text-sm text-center">
            "{getMascotMessage()}"
          </p>
        </div>
      </div>

      <LogModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={onLogSession} costPerGram={costPerGram} />
    </div>
  );
};