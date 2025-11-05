import React from 'react';

export type Address = {
  id: string;
  alias: string;
  address: string;
  number: string;
  comment: string;
  region: string;
  province: string;
  commune: string;
  postalCode: string;
  phone: string;
};

export function useAddresses(profileId: string) {
  const key = `fixsy_addresses_${profileId}`;

  const read = React.useCallback((): Address[] => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as Address[]) : []; } catch { return []; }
  }, [key]);

  const [addresses, setAddresses] = React.useState<Address[]>(read);

  const persist = React.useCallback((next: Address[]) => {
    setAddresses(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [key]);

  const add = React.useCallback((addr: Omit<Address, 'id'>) => {
    const full: Address = { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, ...addr };
    persist([full, ...addresses]);
  }, [addresses, persist]);

  const update = React.useCallback((id: string, patch: Partial<Address>) => {
    const next = addresses.map(a => (a.id === id ? { ...a, ...patch } : a));
    persist(next);
  }, [addresses, persist]);

  const remove = React.useCallback((id: string) => {
    persist(addresses.filter(a => a.id !== id));
  }, [addresses, persist]);

  return { addresses, add, update, remove } as const;
}
