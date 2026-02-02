import { useState, useEffect, useCallback } from 'react';

export interface TokenOverrides {
  [key: string]: string | number;
}

export const useTokenPlayground = () => {
  const [overrides, setOverrides] = useState<TokenOverrides>({});

  const updateOverride = useCallback((name: string, value: string | number) => {
    setOverrides((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  useEffect(() => {
    const styleId = 'token-playground-overrides';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    if (Object.keys(overrides).length === 0) {
      styleTag.innerHTML = '';
      return;
    }

    const cssRules = Object.entries(overrides)
      .map(([name, value]) => `  ${name}: ${value} !important;`)
      .join('\n');

    styleTag.innerHTML = `:root {\n${cssRules}\n}`;
  }, [overrides]);

  return { overrides, updateOverride, resetOverrides };
};
