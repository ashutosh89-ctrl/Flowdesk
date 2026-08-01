'use client';

import React, { useState, useCallback } from 'react';
import { useApp } from '@/components/AppContext';
import { processRazorpayPayment } from '@/lib/services/invoiceService';
import { Loader2, CreditCard } from 'lucide-react';

interface RazorpayCheckoutProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  businessName: string;
  clientEmail?: string;
  clientPhone?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

export default function RazorpayCheckout({
  invoiceId,
  invoiceNumber,
  amount,
  currency,
  businessName,
  clientEmail,
  clientPhone,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);

  // Load Razorpay SDK dynamically
  const loadRazorpay = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Convert amount to smallest currency unit (paise for INR, cents for others)
  const getAmountInSmallestUnit = (amt: number, curr: string): number => {
    // INR uses paise (1 INR = 100 paise)
    // Most currencies use 2 decimal places
    const nonDecimalCurrencies = ['JPY'];
    if (nonDecimalCurrencies.includes(curr.toUpperCase())) {
      return Math.round(amt);
    }
    return Math.round(amt * 100);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        addToast('Failed to load payment gateway. Please try again.', 'warning');
        setLoading(false);
        return;
      }

      // Generate a mock order ID (in production, this comes from your backend)
      const mockOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: getAmountInSmallestUnit(amount, currency),
        currency: currency,
        name: businessName || 'FlowDesk',
        description: `Invoice #${invoiceNumber}`,
        order_id: mockOrderId,
        prefill: {
          email: clientEmail || '',
          contact: clientPhone || '',
        },
        theme: {
          color: '#111827',
        },
        handler: async function (response: any) {
          try {
            // Process the successful payment
            const result = await processRazorpayPayment(
              invoiceId,
              response.razorpay_payment_id,
              response.razorpay_order_id,
              'UPI / Cards'
            );
            addToast(`Payment successful! Receipt: ${result.receipt.receiptNumber}`, 'success');
            onSuccess();
          } catch (err: any) {
            addToast(err.message || 'Payment verification failed', 'warning');
            onError(err.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            addToast('Payment cancelled', 'info');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        addToast(`Payment failed: ${response.error.description}`, 'warning');
        onError(response.error.description || 'Payment failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      addToast(err.message || 'Failed to initialize payment', 'warning');
      onError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CreditCard className="w-3.5 h-3.5" />
      )}
      {loading ? 'Processing...' : 'Pay with Razorpay'}
    </button>
  );
}
