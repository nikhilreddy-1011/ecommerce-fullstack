import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ShopX — Modern E-Commerce',
    template: '%s | ShopX',
  },
  description:
    'ShopX is a modern, multi-seller e-commerce platform. Browse thousands of products, track orders, and shop securely.',
  keywords: ['ecommerce', 'shopping', 'online store', 'shopx'],
  authors: [{ name: 'ShopX Team' }],
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <Providers>
          <Navbar />
          <main>{children}</main>

        </Providers>
      </body>
    </html>
  );
}

