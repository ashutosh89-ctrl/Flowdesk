import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

      // Primary: notes.invoice_id holds the DB row id (production flow).
      // Fallback: the Razorpay description is "Invoice #INV-2026-0001" — that is
      // the invoice NUMBER, so we must match the invoice_number column, not id.
      const notesInvoiceId = notes.invoice_id;
      const descriptionNumber = payment.description?.match(/INV-[\w-]+/)?.[0];

      if (!notesInvoiceId && !descriptionNumber) {
        return NextResponse.json(
          { error: 'Invoice ID not found in payment notes', received: true },
          { status: 200 } // Return 200 to acknowledge receipt even if we can't process
        );
      }

      try {
        // Webhook requests carry no user session, so writes run under the
        // service-role client (bypasses RLS) — mirroring the client-side
        // processRazorpayPayment flow in invoiceService.
        let query = supabaseAdmin.from('invoices').select('*');
        if (notesInvoiceId) {
          query = query.eq('id', notesInvoiceId);
        } else {
          query = query.eq('invoice_number', descriptionNumber);
        }
        const { data: invoice, error: invoiceError } = await query.maybeSingle();

        if (invoiceError || !invoice) {
          return NextResponse.json(
            { error: 'Invoice not found', received: true },
            { status: 200 }
          );
        }

        // Idempotency guard: the client-side RazorpayCheckout handler also
        // processes payments, and Razorpay retries webhooks — skip if this
        // payment was already recorded to avoid duplicate receipts/activities.
        // Keyed on payment_id only (not payment_status) so a partial failure
        // (invoice paid but receipt missing) can still be recovered on retry.
        // limit(1) keeps the guard robust even if duplicate receipts somehow
        // already exist (maybeSingle would error on multiple matches).
        const { data: existingReceipt } = await supabaseAdmin
          .from('invoice_receipts')
          .select('id')
          .eq('payment_id', payment.id)
          .limit(1)
          .maybeSingle();

        if (existingReceipt) {
          return NextResponse.json({
            received: true,
            status: 'already_processed',
          });
        }

        const now = new Date().toISOString();

        // 1. Mark invoice paid
        await supabaseAdmin
          .from('invoices')
          .update({
            payment_status: 'paid',
            payment_method_type: 'razorpay',
            status: 'paid',
            updated_at: now,
          })
          .eq('id', invoice.id);

        // 2. Generate receipt
        const { data: receipts } = await supabaseAdmin
          .from('invoice_receipts')
          .select('*');
        const year = new Date().getFullYear();
        const receiptNum = `REC-${year}-${String((receipts?.length || 0) + 1).padStart(4, '0')}`;

        const { data: receipt } = await supabaseAdmin
          .from('invoice_receipts')
          .insert({
            id: `rec_${Math.random().toString(36).substring(2, 9)}`,
            receipt_number: receiptNum,
            invoice_id: invoice.id,
            payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            razorpay_payment_id: payment.id,
            payment_method: `Razorpay (${payment.method || 'UPI / Cards'})`,
            amount_paid: invoice.total,
            currency: invoice.currency,
            paid_at: now,
          })
          .select()
          .single();

        // 3. Log activities
        await supabaseAdmin.from('invoice_activities').insert([
          {
            id: `act_${Math.random().toString(36).substring(2, 9)}`,
            invoice_id: invoice.id,
            activity_type: 'payment_completed',
            description: `Payment of ${invoice.currency} ${Number(invoice.total).toLocaleString()} verified via Razorpay (${payment.id})`,
            actor: 'Client',
            timestamp: now,
          },
          {
            id: `act_${Math.random().toString(36).substring(2, 9)}`,
            invoice_id: invoice.id,
            activity_type: 'receipt_generated',
            description: `Receipt ${receiptNum} generated for Invoice ${invoice.invoice_number}`,
            actor: 'System',
            timestamp: now,
          },
        ]);

        return NextResponse.json({
          received: true,
          status: 'processed',
          receipt: receipt?.receipt_number || receiptNum,
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
