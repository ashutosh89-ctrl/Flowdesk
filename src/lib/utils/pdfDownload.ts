import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDFDocument } from '@/components/invoices/InvoicePDFDocument';

export async function downloadInvoicePDF(invoice: any, business: any, client: any): Promise<void> {
  const fileName = `${invoice.invoiceNumber || invoice.number || invoice.id || 'Invoice'}.pdf`;

  try {
    const docElement = React.createElement(InvoicePDFDocument, { invoice, business, client });
    const instance = pdf(docElement as any);
    const blob = await instance.toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('PDF generation via @react-pdf/renderer failed, using html2canvas fallback:', error);
    
    // Canvas + jsPDF fallback on invoice container element
    const printArea = document.querySelector('.invoice-print-container') || document.getElementById('invoice-print-area');
    if (printArea) {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        const canvas = await html2canvas(printArea as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfDoc = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdfDoc.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdfDoc.save(fileName);
        return;
      } catch (canvasErr) {
        console.error('html2canvas PDF fallback failed:', canvasErr);
      }
    }

    // Secondary fallback: invoke browser print dialog with print CSS isolation
    window.print();
  }
}

