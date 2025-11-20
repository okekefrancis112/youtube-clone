// components/NoFlashScript.tsx
'use client';

import { useEffect } from 'react';

export function NoFlashScript() {
  useEffect(() => {
    // Remove extension-added attributes after hydration
    document.documentElement.removeAttribute('data-qb-installed');
    document.documentElement.removeAttribute('data-new-gr-c-s-check-loaded');
    document.documentElement.removeAttribute('data-gr-ext-installed');
    document.body.removeAttribute('data-gr-ext-installed');
    document.body.removeAttribute('data-new-gr-c-s-check-loaded');
  }, []);

  return null;
}