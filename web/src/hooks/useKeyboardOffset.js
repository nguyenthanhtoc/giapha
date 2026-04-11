'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks visualViewport state to handle on-screen keyboard on mobile.
 *
 * Returns:
 *  - keyboardOffset: pixels the keyboard pushes up from the bottom (use to lift bottom-anchored panels)
 *  - viewportScrollTop: pixels the visual viewport has scrolled down (use to pin top-anchored elements)
 */
export function useKeyboardOffset() {
  const [state, setState] = useState({ keyboardOffset: 0, viewportScrollTop: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const keyboardOffset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const viewportScrollTop = vv.offsetTop;
      setState({ keyboardOffset, viewportScrollTop });
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return state;
}
