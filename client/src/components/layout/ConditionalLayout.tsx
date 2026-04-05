"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import CartSidebar from '@/components/cart/CartSidebar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="flex-grow flex flex-col relative z-0 pt-20">
        {children}
      </main>
    </>
  );
}
