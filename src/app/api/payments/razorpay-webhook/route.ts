import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processRazorpayPayment } from '@/lib/services/invoiceService';

// In production, this should be RAZORPAY_WEBHOOK_SECRET from env
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    if (WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    // Handle payment.captured event
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const notes = payment.notes || {};
      const invoiceId = notes.invoice_id || payment.description?.match(/INV-[\w-]+/)?.[0];

      if (!invoiceId) {
        return NextResponse.json(
          { error: 'Invoice ID not found in payment notes', received: true },
          { status: 200 } // Return 200 to acknowledge receipt even if we can't process
        );
      }

      try {
        const result = await processRazorpayPayment(
          invoiceId,
          payment.id,
          payment.order_id,
          payment.method || 'UPI / Cards'
        );

        return NextResponse.json({
          received: true,
          status: 'processed',
          receipt: result.receipt.receiptNumber,
        });
      } catch (err: any) {
        console.error('Failed to process Razorpay payment:', err);
        return NextResponse.json(
          { error: 'Failed to process payment', received: true },
          { status: 200 } // Return 200 to acknowledge receipt
        );
      }
    }

    // Acknowledge other events
    return NextResponse.json({ received: true, event });
  } catch (err: any) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
