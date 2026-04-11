'use client';

import { useEffect, useState } from 'react';

/**
 * Detects the on-screen keyboard height using the visualViewport API.
 * Returns { keyboardOffset } — pixels the keyboard pushes up from the bottom.
 * Use this to lift bottom-anchored panels above the keyboard.
 *
 * On desktop or when keyboard is hidden, returns 0.
 */
export function useKeyboardOffset() {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setKeyboardOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return { keyboardOffset };
}
