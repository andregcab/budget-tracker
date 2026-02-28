import { useLayoutEffect, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'app-scroll-positions';

function readPositions(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePosition(pathname: string, y: number) {
  try {
    const positions = readPositions();
    positions[pathname] = y;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // ignore
  }
}

/**
 * Scroll restoration keyed by pathname so returning to a route (e.g. /transactions)
 * restores the same scroll position regardless of navigation direction.
 *
 * - Saves on scroll and every 400ms so we have the latest position.
 * - Saves again on internal link click (capture phase) so we capture the page we're leaving
 *   before navigation (e.g. "at top of Categories" when clicking Transactions).
 * - Restores in useLayoutEffect when entering a route (before paint).
 * - For /transactions, content is async so the document can be short when we first
 *   restore; we re-apply scroll after short delays so we restore once the list has
 *   rendered and the page height is correct (avoids being clamped).
 */
export function ScrollRestoration() {
  const location = useLocation();
  const pathname = location.pathname;
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Save on every scroll for the current pathname.
  useEffect(() => {
    const save = () => {
      const y = window.scrollY ?? document.documentElement.scrollTop;
      writePosition(pathnameRef.current, y);
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);

  // Save periodically so we capture "at top" even if scroll events were missed.
  useEffect(() => {
    const interval = setInterval(() => {
      const y = window.scrollY ?? document.documentElement.scrollTop;
      writePosition(pathnameRef.current, y);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Save the current page's scroll when the user clicks an internal link, *before* navigation.
  // That way we capture where they were on the page they're leaving (e.g. top of Categories).
  useEffect(() => {
    const onCapture = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a[href^="/"]');
      if (!target) return;
      const y = window.scrollY ?? document.documentElement.scrollTop;
      writePosition(pathnameRef.current, y);
    };
    document.addEventListener('click', onCapture, true);
    return () => document.removeEventListener('click', onCapture, true);
  }, []);

  useLayoutEffect(() => {
    pathnameRef.current = pathname;
    // (We don't save here; the scroll listener already saved the previous page.)

    // Restore the page we're entering, or scroll to top if no position is stored.
    const positions = readPositions();
    const targetY = positions[pathname];
    if (typeof targetY === 'number' && targetY > 0) {
      window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });

      // When switching from a short page to a tall one (e.g. Categories → Transactions),
      // the document may not be full height yet so the first restore gets clamped.
      // Re-apply after delays so we restore once layout has settled.
      if (pathname === '/transactions') {
        const t1 = setTimeout(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (maxScroll >= targetY - 10) {
            window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
          }
        }, 200);
        const t2 = setTimeout(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (maxScroll >= targetY - 10 && window.scrollY < targetY - 20) {
            window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
          }
        }, 600);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    } else {
      // No saved position for this route: reset to top so we don't keep the previous page's scroll.
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
