import { useEffect } from 'react';

/**
 * Dynamically loads a token CSS file into the document head.
 * @param path The absolute path from public root (e.g. "/tokens/brand-a/app-1/variables.css")
 */
export const useTokenLoader = (path: string | undefined) => {
  useEffect(() => {
    if (!path) return;

    // Create new link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    link.id = 'dynamic-tokens';

    // Remove existing link if any
    const existingLink = document.getElementById('dynamic-tokens');
    if (existingLink) {
      existingLink.remove();
    }

    document.head.appendChild(link);

    return () => {
      // Optional: cleanup if needed, but usually we want to keep the styles until the next switch
    };
  }, [path]);
};
