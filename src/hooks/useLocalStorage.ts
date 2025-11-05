import React from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const read = React.useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = React.useState<T>(read);

  const set = React.useCallback((updater: React.SetStateAction<T>) => {
    setValue(prev => {
      const next = typeof updater === 'function' ? (updater as (v: T) => T)(prev) : updater;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  const refresh = React.useCallback(() => setValue(read()), [read]);

  return { value, setValue: set, refresh } as const;
}

