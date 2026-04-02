"use client";

import type { ReactNode } from 'react';

import { Navbar } from '@/components/Navbar';

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
