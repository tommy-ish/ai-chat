import type { Metadata } from 'next';
import './globals.css';
import { ChatProvider } from '@/contexts/ChatContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'AI Chat - エンターテイメント向けAIチャットボット',
  description:
    '匿名で利用可能なAIチャットボット。自然な対話を楽しめます。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <ErrorBoundary>
          <ChatProvider>{children}</ChatProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
