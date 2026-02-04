import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Fira_Code, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const sans = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
});

const darkSans = Inter({
  subsets: ['latin'],
  variable: '--font-dark-sans',
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
      <body className={`${sans.variable} ${mono.variable} ${darkSans.variable} font-sans h-full`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}