import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { numberToWords } from '@/lib/utils/numberToWords';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#111827',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  businessInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  metaInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  billTo: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 8,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eeeeee',
  },
  colDescription: { width: '45%' },
  colQty: { width: '15%', textAlign: 'right' },
  colRate: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666666',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
  },
  tableCellAmount: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#666666',
  },
  totalValue: {
    fontSize: 9,
    color: '#333333',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#111827',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  amountInWords: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#555555',
    marginBottom: 20,
  },
  bankDetails: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bankLabel: {
    width: 90,
    fontSize: 8,
    color: '#666666',
  },
  bankValue: {
    fontSize: 8,
    color: '#333333',
    fontWeight: 'bold',
  },
  terms: {
    marginBottom: 30,
  },
  termsText: {
    fontSize: 8,
    color: '#666666',
    lineHeight: 1.5,
  },
  signature: {
    marginTop: 30,
    alignSelf: 'flex-end',
    width: 180,
    textAlign: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginBottom: 4,
    paddingTop: 4,
  },
  signatureText: {
    fontSize: 9,
    color: '#333333',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
  },
});

interface InvoicePDFProps {
  invoice: any;
  business: any;
  client: any;
}

export function InvoicePDFDocument({ invoice, business, client }: InvoicePDFProps) {
  const currency = invoice.currency || 'USD';
  const amountWords = numberToWords(invoice.total || 0, currency);
  const invNumber = invoice.number || invoice.invoiceNumber || invoice.id;

  const items = invoice.lineItems || invoice.items || [
    { description: 'Design Services', quantity: 1, rate: invoice.subtotal || invoice.total, amount: invoice.subtotal || invoice.total }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>
                {business?.businessName || 'FlowDesk Studio'}
              </Text>
              {business?.tagline && (
                <Text style={{ fontSize: 8, color: '#666666' }}>{business.tagline}</Text>
              )}
            </View>
          </View>
          <View style={styles.businessInfo}>
            {business?.businessPhone && <Text>{business.businessPhone}</Text>}
            {business?.businessEmail && <Text>{business.businessEmail}</Text>}
            {business?.address && <Text>{business.address}</Text>}
          </View>
        </View>

        {/* Invoice Meta */}
        <View style={styles.titleSection}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View style={styles.metaInfo}>
            <Text><Text style={styles.bold}>Invoice No:</Text> {invNumber}</Text>
            <Text><Text style={styles.bold}>Issue Date:</Text> {invoice.issueDate || invoice.createdAt || 'N/A'}</Text>
            <Text><Text style={styles.bold}>Due Date:</Text> {invoice.dueDate || 'N/A'}</Text>
            <Text><Text style={styles.bold}>Currency:</Text> {currency}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.sectionLabel}>Billed To</Text>
          <Text style={styles.clientName}>{client?.name || invoice.clientName || 'Client'}</Text>
          {client?.company && <Text style={styles.clientDetail}>{client.company}</Text>}
          {client?.email && <Text style={styles.clientDetail}>{client.email}</Text>}
          {client?.phone && <Text style={styles.clientDetail}>{client.phone}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item: any, i: number) => {
            const itemAmount = item.amount ?? ((item.quantity || 1) * (item.rate || 0));
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity || 1}</Text>
                <Text style={[styles.tableCell, styles.colRate]}>{formatPDFCurrency(item.rate || 0, currency)}</Text>
                <Text style={[styles.tableCellAmount, styles.colAmount]}>{formatPDFCurrency(itemAmount, currency)}</Text>
              </View>
            );
          })}

        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatPDFCurrency(invoice.subtotal || invoice.total, currency)}</Text>
            </View>
            {invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>-{formatPDFCurrency(invoice.discount, currency)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate || 0}%):</Text>
              <Text style={styles.totalValue}>{formatPDFCurrency(invoice.taxAmount || 0, currency)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>{formatPDFCurrency(invoice.total, currency)}</Text>
            </View>
          </View>
        </View>

        {/* Amount in Words */}
        <Text style={styles.amountInWords}>
          Amount in Words: {amountWords}
        </Text>

        {/* Bank Details */}
        {business?.bankName && (
          <View style={styles.bankDetails}>
            <Text style={[styles.sectionLabel, { marginBottom: 6 }]}>Payment Transfer Info</Text>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank Name:</Text>
              <Text style={styles.bankValue}>{business.bankName}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>A/C Number:</Text>
              <Text style={styles.bankValue}>{business.accountNumber}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>SWIFT / Code:</Text>
              <Text style={styles.bankValue}>{business.bankCode}</Text>
            </View>
          </View>
        )}

        {/* Terms */}
        {business?.termsAndConditions && (
          <View style={styles.terms}>
            <Text style={styles.sectionLabel}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{business.termsAndConditions}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>For {business?.businessName || 'FlowDesk Studio'}</Text>
          <Text style={{ fontSize: 7, color: '#999999', marginTop: 2 }}>Authorized Signatory</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is an official commercial invoice generated via FlowDesk OS.</Text>
          <Text>For billing support, contact {business?.businessEmail || 'billing@flowdesk.io'}</Text>
        </View>
      </Page>
    </Document>
  );
}

function formatPDFCurrency(amount: number, currency: string) {
  const symbols: Record<string, string> = {
    INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', CAD: 'C$', AUD: 'A$', JPY: '¥'
  };
  const symbol = symbols[currency] || '';
  return `${symbol}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
