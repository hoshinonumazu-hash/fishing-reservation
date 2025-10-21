import React from 'react';
import Header from '@/components/Header';

export default function BoatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
