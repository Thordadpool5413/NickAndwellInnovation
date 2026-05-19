import './globals.css';
import type { Metadata } from 'next';
import StorageCleanup from './storage-cleanup';
import AppHeader from '../components/AppHeader';

export const metadata: Metadata = {
  title: 'Andwell Innovation Command Center',
  description: 'Competitive intelligence, growth planning, staffing, and board-ready strategy for Andwell Health Partners.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <StorageCleanup />
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
