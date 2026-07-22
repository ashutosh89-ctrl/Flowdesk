import './globals.css';
import { AppProvider } from '../components/AppContext';
import ToastWrapper from '../components/ToastWrapper';

export const metadata = {
  title: 'FlowDesk',
  description: 'A comprehensive Client Workspace Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          {children}
          <ToastWrapper />
        </AppProvider>
      </body>
    </html>
  );
}
