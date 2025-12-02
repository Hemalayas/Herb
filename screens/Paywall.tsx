import React from 'react';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';

const HERB_IMAGE = "/mascot-level-1.png"; // Updated to use your local image

interface PaywallProps {
  onClose: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative overflow-hidden transition-colors">

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-50 to-transparent dark:from-green-900/20 pointer-events-none" />

      <div className="flex-1 px-6 pt-12 flex flex-col z-10">

        {/* TOP IMAGE */}
        <div className="flex justify-center mb-6 relative">
          <img
            src={HERB_IMAGE}
            alt="Herb"
            className="w-32 h-32 rounded-full object-cover border-4 border-munch-light dark:border-gray-700"
          />

          <div className="absolute -bottom-2 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-full border-2 border-white dark:border-gray-800 text-gray-900">
            PRO
          </div>
        </div>

        <h1 className="text-3xl font-black text-center text-munch-dark dark:text-white mb-2">
          Unlock Full Herb
        </h1>
        <p className="text-center text-munch-med dark:text-gray-400 mb-8">
          Get the most out of your tracking.
        </p>

        {/* Feature List */}
        <div className="space-y-4 mb-8">
          {[
            'Unlimited History',
            'Advanced Stats & Charts',
            'Cost Tracking',
            'Cloud Backup'
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="p-1 bg-green-100 dark:bg-green-900 rounded-full">
                <Check size={16} className="text-munch-green" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{feat}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-3">
          {/* Yearly Plan */}
          <div className="border-2 border-munch-green bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl relative cursor-pointer">
            <div className="absolute -top-3 right-4 bg-munch-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              BEST VALUE
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-munch-dark dark:text-white">Yearly Access</p>
                <p className="text-xs text-munch-med dark:text-gray-400">$39.99 / year</p>
              </div>
              <p className="font-bold text-munch-green">$3.33/mo</p>
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-2xl cursor-pointer hover:border-munch-green transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-munch-dark dark:text-white">Monthly Access</p>
                <p className="text-xs text-munch-med dark:text-gray-400">Billed monthly</p>
              </div>
              <p className="font-bold text-munch-dark dark:text-white">$4.99/mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button section */}
      <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20 transition-colors">
        <Button fullWidth onClick={onClose} className="mb-3 shadow-glow">
          Start 7-Day Free Trial
        </Button>
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Recurring billing. Cancel anytime. <br />
          <span className="underline cursor-pointer">Restore Purchase</span>
        </p>
      </div>
    </div>
  );
};