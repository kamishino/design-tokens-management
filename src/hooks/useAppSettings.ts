import { useState, useEffect, useCallback } from 'react';

export interface IDEConfig {
  id: string;
  name: string;
  /** Editor encoding name for launch-ide */
  editor: string;
}

export interface AppSettings {
  rootPath: string;
  preferredIde: string;
}

export const SUPPORTED_IDES: IDEConfig[] = [
  { id: 'antigravity', name: 'AntiGravity', editor: 'antigravity' },
  { id: 'windsurf', name: 'Windsurf', editor: 'windsurf' },
  { id: 'vscode', name: 'VS Code', editor: 'code' },
  { id: 'cursor', name: 'Cursor', editor: 'cursor' },
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

  /** Open a file in the specified editor via launch-ide server API */
  const openInEditor = useCallback(async (filePath: string, ideId?: string) => {
    const targetIde = SUPPORTED_IDES.find(i => i.id === (ideId || settings.preferredIde)) || SUPPORTED_IDES[0];
    const cleanRoot = settings.rootPath.replace(/[\\/]+$/, '');
    const cleanFile = filePath.replace(/^[\\/]+/, '');
    const fullPath = `${cleanRoot}/${cleanFile}`;

    try {
      const res = await fetch('/api/open-in-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: fullPath, editor: targetIde.editor }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to open in editor:', data.error);
      }
      return data;
    } catch (err) {
      console.error('Failed to open in editor:', err);
    }
  }, [settings]);

  return { settings, updateSettings, openInEditor };
};
