import './globals.css';
import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fredoka',
});

export const metadata: Metadata = {
  title: 'AI Data Query Assistant',
  description: 'Ask natural language questions about your data powered by Gemini AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fredoka.variable} font-sans h-full`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}