import React, { useState } from 'react';
import { ConsumptionMethod, Session } from '../types';
import { Button } from './Button';
import { X, Clock, Save } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Session>) => void;
  costPerGram: number;
}

const METHODS: ConsumptionMethod[] = ['Joint', 'Bong', 'Vape', 'Edible'];
const AMOUNTS = ['0.5g', '1.0g', '1.5g', '2.0g'];

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave, costPerGram }) => {
  const [method, setMethod] = useState<ConsumptionMethod>('Joint');
  const [amount, setAmount] = useState<string>('1.0g');
  const [strain, setStrain] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Parse amount (remove 'g') and multiply by costPerGram
    const amountFloat = parseFloat(amount) || 1.0;
    const calculatedCost = amountFloat * costPerGram;

    onSave({
      method,
      amount,
      strain: strain || 'Unknown Strain',
      cost: calculatedCost
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up transition-colors">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-munch-dark dark:text-white">Log Session</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Methods */}
        <div className="mb-6">
          <label className="text-sm font-bold text-munch-med dark:text-gray-400 mb-3 block">Method</label>
          <div className="flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  method === m 
                    ? 'bg-munch-green text-white shadow-md scale-105' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {m === 'Joint' ? '🚬' : m === 'Bong' ? '💨' : m === 'Vape' ? '🔋' : '🍪'} {m}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="text-sm font-bold text-munch-med dark:text-gray-400 mb-3 block">Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                  amount === a
                    ? 'bg-munch-green text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="mt-2 text-right text-xs text-gray-400 dark:text-gray-500 font-medium">
             Est. Cost: ${(parseFloat(amount) * costPerGram).toFixed(2)}
          </div>
        </div>

        {/* Strain */}
        <div className="mb-8">
          <label className="text-sm font-bold text-munch-med dark:text-gray-400 mb-3 block">Strain (Optional)</label>
          <input
            type="text"
            value={strain}
            onChange={(e) => setStrain(e.target.value)}
            placeholder="e.g. Blue Dream"
            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-munch-green dark:text-white rounded-xl p-3 outline-none transition-all"
          />
        </div>

        <div className="flex gap-3">
           <Button 
             variant="secondary" 
             className="flex-1 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600" 
             onClick={() => {
               // Quick internal log button
               const quickCost = 0.5 * costPerGram;
               onSave({ method: 'Joint', amount: '0.5g', strain: 'Quick Log', cost: quickCost });
               onClose();
             }}
            >
            <Clock size={18} /> Quick
          </Button>
          <Button 
            variant="primary" 
            className="flex-[2]" 
            onClick={handleSave}
          >
            <Save size={18} /> Save Session
          </Button>
        </div>

      </div>
    </div>
  );
};