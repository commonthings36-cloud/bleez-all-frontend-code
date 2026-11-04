import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Force clear old caches on app start
const clearOldCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          // Clear all caches except the latest version
          if (!cacheName.includes('aitravelglobe-v2')) {
            console.log('Bleez: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
};

// Clear caches on startup
clearOldCaches();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('Bleez: App ready for offline use');
  },
  onUpdate: (registration) => {
    console.log('Bleez: New version available');
    // Auto-update without asking
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
});
