'use client';

import { useEffect, useState } from 'react';

/**
 * Detects the on-screen keyboard height using the visualViewport API.
 * Returns the number of pixels the keyboard is pushing up from the bottom.
 *
 * On desktop or when keyboard is hidden, returns 0.
 */
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // keyboard height = layout viewport bottom - visual viewport bottom
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(Math.max(0, keyboardHeight));
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}
