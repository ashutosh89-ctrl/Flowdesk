"use client";
import React from 'react';
import { useApp } from './AppContext';
import { ToastContainer } from './Toast';

export default function ToastWrapper() {
  const { toasts, removeToast } = useApp();
  return <ToastContainer toasts={toasts} removeToast={removeToast} />;
}
