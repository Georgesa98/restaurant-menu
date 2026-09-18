'use client';

import type { ReactNode } from 'react';

/**
 * Category landing grid mirroring the Flutter CategoryGridSliver:
 * 2 columns on phones, 3 columns on wide screens (≥900px), 14px gaps.
 */
export function CategoryGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 min-[900px]:grid-cols-3" style={{ gap: '14px' }}>
      {children}
    </div>
  );
}
