import { useState, useEffect, useCallback } from 'react';

export interface IDEConfig {
  id: string;
  name: string;
  protocol: string;
}

export interface AppSettings {
  rootPath: string;
  preferredIde: string;
}

export const SUPPORTED_IDES: IDEConfig[] = [
  { id: 'windsurf', name: 'Windsurf', protocol: 'windsurf://' },
  { id: 'vscode', name: 'VS Code', protocol: 'vscode://' },
  { id: 'cursor', name: 'Cursor', protocol: 'cursor://' },
];

const STORAGE_KEY = 'kami_app_settings';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultRoot = import.meta.env.VITE_PROJECT_ROOT || '';
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        rootPath: parsed.rootPath || defaultRoot,
        preferredIde: parsed.preferredIde || 'windsurf',
      };
    }
    
    return {
      rootPath: defaultRoot,
      preferredIde: 'windsurf',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getFullIdePath = useCallback((filename: string, ideId?: string) => {
    const targetIde = SUPPORTED_IDES.find(i => i.id === (ideId || settings.preferredIde)) || SUPPORTED_IDES[0];
    const cleanRoot = settings.rootPath.replace(/\/$/, '');
    const fullPath = `${cleanRoot}/tokens/global/base/${filename}`;
    return `${targetIde.protocol}file/${fullPath}`;
  }, [settings]);

  return { settings, updateSettings, getFullIdePath };
};
