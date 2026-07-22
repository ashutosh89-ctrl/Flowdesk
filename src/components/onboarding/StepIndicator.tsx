"use client";
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;
        
        return (
          <React.Fragment key={stepNum}>
            {/* Step circle */}
            <div className="flex flex-col items-center relative">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-xs ${
                  isCompleted 
                    ? 'bg-gray-900 border-gray-900 text-white' 
                    : isActive 
                    ? 'bg-white border-gray-900 text-gray-900 shadow-md ring-2 ring-gray-900/10' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  stepNum
                )}
              </div>
              <span className={`absolute -bottom-6 text-[10px] whitespace-nowrap font-medium transition-colors ${
                isActive ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}>
                Step {stepNum}
              </span>
            </div>
            
            {/* Connecting Line */}
            {stepNum < totalSteps && (
              <div className="flex-1 h-[2px] mx-2 transition-colors duration-300 bg-gray-200" style={{
                backgroundColor: currentStep > stepNum ? '#111827' : '#E5E7EB'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
