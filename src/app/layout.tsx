import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Моменты',
  description: 'Платформа для сохранения лучших моментов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
