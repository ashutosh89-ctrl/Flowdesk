import './globals.css';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AppProvider } from '../components/AppContext';
import ToastWrapper from '../components/ToastWrapper';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { QuickSearch } from '@/components/shared/QuickSearch';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'FlowDesk - Client Portal & Freelancer Workspace',
  description: 'A comprehensive Client Workspace Platform for freelancers and clients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
          <ToastWrapper />
          <CommandPalette />
          <QuickSearch />
        </AppProvider>
      </body>
    </html>
  );
}
