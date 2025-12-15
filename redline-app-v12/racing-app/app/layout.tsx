import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Redline - Street Racing Clips & Performance Tracking',
  description: 'Share your racing clips, track your 0-60 times, and compete on the leaderboards.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-racing-gradient min-h-screen">
        {children}
      </body>
    </html>
  );
}
