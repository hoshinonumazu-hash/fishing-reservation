export const metadata = {
  title: '釣り船予約サイト',
  description: '釣り船の検索・予約ができるサイト',
}

import '../globals.css'
import Header from '../../components/Header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}