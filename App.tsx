import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { Session, UserPreferences, ScreenName } from './types';
import { Onboarding } from './screens/Onboarding';
import { Paywall } from './screens/Paywall';
import { Home } from './screens/Home';
import { Stats } from './screens/Stats';
import { RecoveryStats } from './screens/RecoveryStats'; 
import { Settings } from './screens/Settings';
import { Home as HomeIcon, BarChart2, Settings as SettingsIcon, Heart } from 'lucide-react'; 

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>({
    hasOnboarded: false,
    hasPremium: false,
    dailyGoal: 3,
    weeklyGoal: 15,
    goalPeriod: 'day',
    costPerGram: 10,
    selectedGoal: 'Track',
    isDarkMode: false,
    tBreakTarget: null,
    isQuitting: false 
  });
  
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Onboarding');
  const [activeTab, setActiveTab] = useState<'Home' | 'Stats' | 'Settings'>('Home');
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Load Data
    const loadedSessions = StorageService.getSessions();
    const loadedPrefs = StorageService.getPreferences();
    
    setSessions(loadedSessions);
    setPrefs(loadedPrefs);
    
    if (loadedPrefs.hasOnboarded) {
       setCurrentScreen('Home');
    }
    
    setIsLoading(false);
  }, []);

  const handleOnboardingFinish = (goal: string) => {
    const newPrefs = StorageService.savePreferences({ 
      hasOnboarded: true, 
      selectedGoal: goal 
    });
    setPrefs(newPrefs);
    setShowPaywall(true); 
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    setCurrentScreen('Home');
  };

  const handleLogSession = (sessionData: Partial<Session>) => {
    const newSession: Session = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      method: sessionData.method || 'Joint',
      amount: sessionData.amount || '1g',
      strain: sessionData.strain || '',
      cost: sessionData.cost || 0,
      ...sessionData
    };
    
    const updatedSessions = StorageService.saveSession(newSession);
    setSessions(updatedSessions);
  };

  const handleUndoLastSession = () => {
    if (sessions.length === 0) return;
    const newSessions = sessions.slice(1);
    StorageService.overwriteSessions(newSessions);
    setSessions(newSessions);
  };

  const handleReset = () => {
    StorageService.clearSessions();
    setSessions([]);
    StorageService.savePreferences({ hasOnboarded: false });
    setPrefs(prev => ({ ...prev, hasOnboarded: false }));
    setCurrentScreen('Onboarding');
  };

  const toggleDarkMode = () => {
    const newMode = !prefs.isDarkMode;
    const newPrefs = StorageService.savePreferences({ isDarkMode: newMode });
    setPrefs(newPrefs);
  };

  const handleUpdatePrefs = (newPrefs: Partial<UserPreferences>) => {
    const updated = StorageService.savePreferences(newPrefs);
    setPrefs(updated);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-munch-green text-white font-bold">Loading Herb...</div>;

  return (
    <div className={`${prefs.isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center font-sans text-gray-900 dark:text-white transition-colors">
        {/* Mobile Wrapper */}
        <div className="w-full max-w-md bg-white dark:bg-gray-900 h-screen sm:h-[850px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-4 border-gray-900/5 dark:border-gray-800">
          
          <div className="flex-1 overflow-hidden relative">
             {!prefs.hasOnboarded ? (
                <div className="h-full">
                  <Onboarding onFinish={handleOnboardingFinish} />
                  {showPaywall && (
                    <div className="absolute inset-0 z-50 animate-slide-up">
                      <Paywall onClose={handlePaywallClose} />
                    </div>
                  )}
                </div>
             ) : showPaywall ? (
               <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 animate-fade-in">
                 <Paywall onClose={() => setShowPaywall(false)} />
               </div>
             ) : (
               <>
                 {activeTab === 'Home' && (
                   <Home 
                     sessions={sessions} 
                     onLogSession={handleLogSession} 
                     onUndo={handleUndoLastSession}
                     dailyGoal={prefs.dailyGoal} 
                     weeklyGoal={prefs.weeklyGoal}
                     goalPeriod={prefs.goalPeriod}
                     costPerGram={prefs.costPerGram}
                     tBreakTarget={prefs.tBreakTarget}
                     isQuitting={prefs.isQuitting} // 🆕 Passed here
                   />
                 )}
                 {activeTab === 'Stats' && (
                   prefs.isQuitting ? (
                     <RecoveryStats 
                        sessions={sessions} 
                        costPerGram={prefs.costPerGram} 
                     />
                   ) : (
                     <Stats 
                       sessions={sessions} 
                       costPerGram={prefs.costPerGram} 
                     />
                   )
                 )}
                 {activeTab === 'Settings' && (
                   <Settings 
                     preferences={prefs} 
                     onReset={handleReset} 
                     onToggleDarkMode={toggleDarkMode} 
                     onUpdatePrefs={handleUpdatePrefs}
                   />
                 )}
               </>
             )}
          </div>

          {/* Bottom Navigation */}
          {prefs.hasOnboarded && !showPaywall && (
            <div className="h-[90px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around items-start pt-4 px-2 z-40 transition-colors">
              {[
                { id: 'Home', icon: HomeIcon, label: 'Home' },
                { 
                    id: 'Stats', 
                    icon: prefs.isQuitting ? Heart : BarChart2, 
                    label: prefs.isQuitting ? 'Recovery' : 'Stats' 
                },
                { id: 'Settings', icon: SettingsIcon, label: 'Settings' }
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className="flex flex-col items-center w-16 group"
                  >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-green-50 dark:bg-green-900/20 -translate-y-1' : 'bg-transparent'}`}>
                      <item.icon 
                        size={24} 
                        className={`transition-colors ${isActive ? (prefs.isQuitting && item.id === 'Stats' ? 'text-red-500' : 'text-munch-green') : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`} 
                        strokeWidth={isActive ? 3 : 2}
                      />
                    </div>
                    <span className={`text-[10px] font-bold mt-1 transition-colors ${isActive ? (prefs.isQuitting && item.id === 'Stats' ? 'text-red-500' : 'text-munch-green') : 'text-gray-400 dark:text-gray-600'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}