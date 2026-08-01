export interface SendEmailPayload {
  to: string;
  subject: string;
  template: 'client_accepted' | 'document_uploaded' | 'deliverable_approved' | 'invoice_viewed' | 'invoice_paid' | 'revision_requested';
  data: Record<string, any>;
}

export async function sendNotificationEmail(payload: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const unsubscribeLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/notifications`;

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
        <div style="border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #111;">FlowDesk Workspace Notification</h2>
        </div>
        <p style="font-size: 14px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 14px; line-height: 1.6;"><strong>${payload.subject}</strong></p>
        <div style="background-color: #f5f4f2; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #333;">${JSON.stringify(payload.data)}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888; text-align: center;">
          FlowDesk Operating System for Freelancers • 
          <a href="${unsubscribeLink}" style="color: #666;">Unsubscribe from email alerts</a>
        </p>
      </div>
    `;

    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'FlowDesk Alerts <alerts@flowdesk.io>',
          to: payload.to,
          subject: payload.subject,
          html: htmlBody
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn('Resend email API returned error:', errText);
      }
    } else {
      console.log(`[Email Simulator] Sent email to ${payload.to}: ${payload.subject}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send notification email:', error);
    return { success: false, error: error.message || 'Email delivery failed' };
  }
}
