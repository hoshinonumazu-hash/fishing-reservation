import React from 'react';

export default function BoatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{ background: '#f0f0f0', padding: 12, marginBottom: 24 }}>
        <a href="/boats" style={{ marginRight: 16 }}>釣り船一覧</a>
        <a href="/">トップへ戻る</a>
      </nav>
      {children}
    </div>
  );
}
