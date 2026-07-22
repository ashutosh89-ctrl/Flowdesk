"use client";
import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';

interface ProfileSetupStepProps {
  name: string;
  onChangeName: (val: string) => void;
  avatar: string;
  onChangeAvatar: (val: string) => void;
  onNext: () => void;
}

export default function ProfileSetupStep({
  name,
  onChangeName,
  avatar,
  onChangeAvatar,
  onNext
}: ProfileSetupStepProps) {
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG, JPEG, and PNG images are supported');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChangeAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG, JPEG, and PNG images are supported');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChangeAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-gray-900">Set Up Your Profile</h3>
        <p className="text-sm text-gray-500">Add an avatar and verify your name to get started</p>
      </div>

      {/* Avatar upload drag-and-drop circle */}
      <div className="flex flex-col items-center justify-center">
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ${
            isDragOver 
              ? 'border-gray-900 bg-gray-50 scale-[1.03] shadow-md' 
              : avatar 
              ? 'border-black/5' 
              : 'border-black/10 hover:border-gray-900 bg-black/5 hover:bg-black/10'
          }`}
        >
          {avatar ? (
            <>
              <img 
                src={avatar} 
                alt="Profile Preview" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mb-1" />
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 leading-tight">Drag / Upload</span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/jpg"
          className="hidden" 
        />
        {error && (
          <p className="text-red-600 text-xs mt-2 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>

      {/* Name Input */}
      <div className="relative">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value);
            if (error) setError('');
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Your Full Name
        </label>
      </div>

      {/* Action Button */}
      <button
        onClick={handleContinue}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 font-medium transition-colors cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
}
