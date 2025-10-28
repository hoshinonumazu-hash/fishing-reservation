'use client';

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation';
import Header from '../components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isOwnerPage = pathname?.startsWith('/owner');

  return (
    <html lang="ja">
      <head>
        <title>釣り予約サイト</title>
        <meta name="description" content="釣り船をオンラインで簡単に検索・予約できるプラットフォーム" />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className={inter.className}>
        {!isOwnerPage && <Header />}
        {children}
      </body>
    </html>
  )
}