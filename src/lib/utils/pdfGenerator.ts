export function generateInvoiceHTML(invoice: any, client: any, freelancer: any): string {
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const subtotal = invoice.subtotal || invoice.amount || 0;
  const tax = invoice.tax || Math.round(subtotal * 0.18);
  const total = invoice.total || subtotal + tax;
  const items = invoice.items || [
    {
      description: invoice.title || 'Freelance Services',
      quantity: 1,
      rate: subtotal,
    },
  ];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${invoice.number || invoice.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1a19; line-height: 1.6; background: #fff; }
    .container { max-width: 800px; margin: 40px auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .brand { font-size: 24px; font-weight: 700; }
    .invoice-title { font-size: 32px; font-weight: 700; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(26,26,25,0.60); margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; padding: 12px; border-bottom: 2px solid #1a1a19; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid rgba(26,26,25,0.10); }
    .totals { margin-top: 30px; border-top: 2px solid #1a1a19; padding-top: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .grand-total { font-size: 20px; font-weight: 700; border-top: 2px solid #1a1a19; padding-top: 12px; margin-top: 12px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid rgba(26,26,25,0.10); font-size: 12px; color: rgba(26,26,25,0.60); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">${freelancer?.name || 'FlowDesk'}</div>
        <div style="color: rgba(26,26,25,0.60); font-size: 14px;">${freelancer?.email || ''}</div>
      </div>
      <div style="text-align: right;">
        <div class="invoice-title">INVOICE</div>
        <div style="font-size: 24px; font-weight: 700;">#${invoice.number || invoice.id}</div>
        <div style="color: rgba(26,26,25,0.60);">${date}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Bill To</div>
      <div style="font-weight: 600;">${client?.name || 'Client'}</div>
      <div>${client?.company || ''}</div>
      <div>${client?.email || ''}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${(item.rate || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right;">₹${((item.quantity || 1) * (item.rate || 0)).toLocaleString('en-IN')}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
      <div class="total-row"><span>GST (18%)</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
      <div class="total-row grand-total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p style="margin-top: 8px;">Payment is due within 15 days of invoice date.</p>
    </div>
  </div>
</body>
</html>`;
}

export function downloadInvoicePDF(invoice: any, client: any, freelancer: any) {
  const html = generateInvoiceHTML(invoice, client, freelancer);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
