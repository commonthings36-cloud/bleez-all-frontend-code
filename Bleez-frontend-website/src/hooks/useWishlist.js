import { useCallback, useEffect, useState } from 'react';

const KEY = 'bleez_wishlist';

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

// Wishlist of saved destination ids, kept in this browser's localStorage.
export default function useWishlist() {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener('storage', sync);
    window.addEventListener('wishlist-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('wishlist-change', sync);
    };
  }, []);

  const toggle = useCallback((id) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    setIds(next);
    window.dispatchEvent(new Event('wishlist-change'));
  }, []);

  return { ids, has: (id) => ids.includes(id), toggle };
}
