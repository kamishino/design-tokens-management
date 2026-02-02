import { useEffect, useRef, useCallback } from 'react';

// Vite handles workers by appending ?worker to the import
import ColorWorker from '../workers/color-worker?worker';

export const useColorWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());

  useEffect(() => {
    workerRef.current = new ColorWorker();
    
    workerRef.current.onmessage = (e) => {
      const { id, data, error } = e.data;
      const request = pendingRequests.current.get(id);
      if (request) {
        if (error) request.reject(new Error(error));
        else request.resolve(data);
        pendingRequests.current.delete(id);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const sendRequest = useCallback((action: string, payload: any) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) return reject(new Error('Worker not initialized'));
      
      const id = Math.random().toString(36).substring(2, 11);
      pendingRequests.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ id, action, payload });
    });
  }, []);

  return {
    convert: (hex: string) => sendRequest('convert', { hex }),
    calculateContrast: (fg: string, bg: string) => sendRequest('contrast', { fg, bg }),
    suggestSwatches: (color: string, baseSwatches: any[], target: 'text' | 'bg') => 
      sendRequest('suggest', { color, baseSwatches, target })
  };
};
