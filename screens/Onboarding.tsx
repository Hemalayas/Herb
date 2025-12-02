import React, { useState } from 'react';
import { Button } from '../components/Button';

const HERB_IMAGE = "/mnt/data/herb-mascot.png";

export const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("track");

  return (
    <div className="flex flex-col h-full justify-between pt-12 pb-8 px-6 bg-white dark:bg-gray-900 transition-colors">

      {/* CENTER CONTENT */}
      <div className="flex-1 flex items-center justify-center w-full">
        {step === 0 && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
            <img
              src={HERB_IMAGE}
              alt="Herb"
              className="w-48 h-48 rounded-full object-cover border-4 border-munch-light"
            />

            <h1 className="text-4xl font-black text-munch-dark dark:text-white tracking-tight">
              Meet Herb
            </h1>

            <p className="text-lg text-munch-med dark:text-gray-400 max-w-xs leading-relaxed">
              Your friendly guide to smarter, happier consumption habits.
            </p>
          </div>
        )}

        {/* Step 1 & 2 remain unchanged */}
      </div>

      {/* The rest of the file unchanged */}
      <div className="w-full space-y-4">
        <div className="flex justify-center gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-munch-green' : 'w-2 bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <Button
          fullWidth
          onClick={() => {
            if (step < 2) setStep(step + 1);
            else onFinish(selectedGoal);
          }}
        >
          {step === 0 ? "Get Started" : step === 2 ? "Let's Go" : "Continue"}
        </Button>
      </div>
    </div>
  );
};
