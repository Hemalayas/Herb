import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { ChevronRight, User, Bell, DollarSign, Database, Info, Shield, Moon, Check, Edit2, Timer, Ban, HeartOff } from 'lucide-react';

interface SettingsProps {
  preferences: UserPreferences;
  onReset: () => void;
  onToggleDarkMode: () => void;
  onUpdatePrefs: (prefs: Partial<UserPreferences>) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-wider">{title}</h3>
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
      {children}
    </div>
  </div>
);

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  isLast?: boolean;
  onClick?: () => void;
  danger?: boolean;
  isEditing?: boolean;
  onEditChange?: (val: string) => void;
  onEditSubmit?: () => void;
  editValue?: string | number;
  editable?: boolean;
}

const Row: React.FC<RowProps> = ({ 
  icon, label, value, isLast, onClick, danger, isEditing, onEditChange, onEditSubmit, editValue, editable
}) => (
  <div 
    onClick={!isEditing ? onClick : undefined}
    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
  >
    <div className={`mr-4 ${danger ? 'text-red-500' : 'text-munch-dark dark:text-white'}`}>{icon}</div>
    <div className={`flex-1 font-medium ${danger ? 'text-red-500' : 'text-munch-dark dark:text-white'}`}>{label}</div>
    
    {isEditing ? (
       <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
         <input 
            type="number" 
            autoFocus
            className="w-24 bg-gray-100 dark:bg-gray-900 rounded-xl px-3 py-2 text-right font-bold text-munch-dark dark:text-white outline-none border-2 border-munch-green shadow-sm"
            value={editValue}
            onChange={(e) => onEditChange && onEditChange(e.target.value)}
            onBlur={onEditSubmit}
            onKeyDown={(e) => e.key === 'Enter' && onEditSubmit && onEditSubmit()}
         />
         <button onClick={onEditSubmit} className="text-white bg-munch-green p-1.5 rounded-full shadow-sm hover:bg-green-600 transition-colors">
           <Check size={14}/>
         </button>
       </div>
    ) : (
      <>
        {value && <div className="text-sm text-gray-400 dark:text-gray-500 font-medium mr-2">{value}</div>}
        {editable && !value && (
          <div className="mr-2">
            <Edit2 size={14} className="text-munch-green" />
          </div>
        )}
        {!value && !editable && <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />}
        {editable && value && <Edit2 size={14} className="text-gray-300 dark:text-gray-600 ml-1 opacity-40 hover:opacity-100 hover:text-munch-green transition-all" />}
      </>
    )}
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ preferences, onReset, onToggleDarkMode, onUpdatePrefs }) => {
  const [editingField, setEditingField] = useState<'cost' | 'goal' | 'tbreak' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const startEditing = (field: 'cost' | 'goal' | 'tbreak', currentVal: number) => {
    setEditingField(field);
    setTempValue(currentVal.toString());
  };

  const submitEdit = () => {
    if (!editingField) return;
    
    const numVal = parseFloat(tempValue);
    if (!isNaN(numVal) && numVal >= 0) {
      if (editingField === 'cost') onUpdatePrefs({ costPerGram: numVal });
      if (editingField === 'goal') {
        if (preferences.goalPeriod === 'week') {
           onUpdatePrefs({ weeklyGoal: Math.round(numVal) });
        } else {
           onUpdatePrefs({ dailyGoal: Math.round(numVal) });
        }
      }
      if (editingField === 'tbreak') {
        const days = Math.round(numVal);
        if (days > 0) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + days);
            onUpdatePrefs({ tBreakTarget: targetDate.toISOString() });
        }
      }
    }
    setEditingField(null);
  };

  const togglePeriod = () => {
    const newPeriod = preferences.goalPeriod === 'day' ? 'week' : 'day';
    onUpdatePrefs({ goalPeriod: newPeriod });
  };

  const toggleQuitting = () => {
      // Toggle the boolean value
      onUpdatePrefs({ isQuitting: !preferences.isQuitting });
  };

  const cancelTBreak = () => {
      if(window.confirm("End your tolerance break early?")) {
          onUpdatePrefs({ tBreakTarget: null });
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 p-6 pt-8 overflow-y-auto pb-24 transition-colors">
      <h1 className="text-2xl font-black text-munch-dark dark:text-white mb-6">Settings</h1>

      <Section title="Account">
        <Row icon={<User size={20} />} label="Premium Status" value={preferences.hasPremium ? 'Active' : 'Free'} />
        <Row icon={<Shield size={20} />} label="Restore Purchase" isLast />
      </Section>

      {/* 🆕 Recovery Mode Section */}
      <Section title="Goals">
        <Row 
            icon={<HeartOff size={20} />} 
            label="Recovery Mode (Quit)" 
            value={
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${preferences.isQuitting ? 'bg-red-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${preferences.isQuitting ? 'translate-x-4' : ''}`} />
                </div>
            }
            isLast
            onClick={toggleQuitting}
        />
      </Section>

      {!preferences.isQuitting && (
        <Section title="Tolerance Break">
            {!preferences.tBreakTarget ? (
                <Row 
                    icon={<Timer size={20} />} 
                    label="Start T-Break" 
                    value="Set Duration" 
                    isLast
                    editable
                    isEditing={editingField === 'tbreak'}
                    editValue={tempValue}
                    onEditChange={setTempValue}
                    onEditSubmit={submitEdit}
                    onClick={() => startEditing('tbreak', 7)}
                />
            ) : (
                <Row 
                    icon={<Ban size={20} />} 
                    label="Cancel Active Break" 
                    value="End Now"
                    danger
                    isLast
                    onClick={cancelTBreak}
                />
            )}
        </Section>
      )}

      {!preferences.isQuitting && (
        <Section title="Tracking Preferences">
            <Row 
            icon={<Info size={20} />} 
            label="Tracking Period" 
            value={
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex text-xs font-bold">
                <span className={`px-3 py-1 rounded-md transition-all ${preferences.goalPeriod === 'day' ? 'bg-white text-munch-green shadow-sm' : 'text-gray-400'}`}>Daily</span>
                <span className={`px-3 py-1 rounded-md transition-all ${preferences.goalPeriod === 'week' ? 'bg-white text-munch-green shadow-sm' : 'text-gray-400'}`}>Weekly</span>
                </div>
            }
            onClick={togglePeriod}
            />

            <Row 
            icon={<Info size={20} />} 
            label={preferences.goalPeriod === 'day' ? "Daily Goal" : "Weekly Goal"}
            value={`${preferences.goalPeriod === 'day' ? preferences.dailyGoal : preferences.weeklyGoal} sessions`} 
            editable
            isEditing={editingField === 'goal'}
            editValue={tempValue}
            onEditChange={setTempValue}
            onEditSubmit={submitEdit}
            onClick={() => startEditing('goal', preferences.goalPeriod === 'day' ? preferences.dailyGoal : preferences.weeklyGoal)}
            />
            
            <Row 
            icon={<DollarSign size={20} />} 
            label="Cost per Gram" 
            value={`$${preferences.costPerGram}`}
            isLast
            editable
            isEditing={editingField === 'cost'}
            editValue={tempValue}
            onEditChange={setTempValue}
            onEditSubmit={submitEdit}
            onClick={() => startEditing('cost', preferences.costPerGram)}
            />
        </Section>
      )}

      <Section title="Preferences">
        <Row 
          icon={<Moon size={20} />} 
          label="Dark Mode" 
          value={
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${preferences.isDarkMode ? 'bg-munch-green' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${preferences.isDarkMode ? 'translate-x-4' : ''}`} />
            </div>
          }
          isLast
          onClick={onToggleDarkMode}
        />
      </Section>

      <Section title="Data">
        <Row icon={<Database size={20} />} label="Export CSV" />
        <Row 
          icon={<Database size={20} />} 
          label="Reset All Data" 
          danger 
          isLast 
          onClick={() => {
            if(window.confirm("Are you sure you want to delete all history?")) {
              onReset();
            }
          }}
        />
      </Section>

      <div className="text-center mt-4 mb-8">
        <p className="text-gray-400 text-sm font-medium">Version 1.3.0</p>
        <p className="text-munch-green font-bold text-sm mt-1 flex items-center justify-center gap-1">
          🦝 Made with Herb
        </p>
      </div>
    </div>
  );
};