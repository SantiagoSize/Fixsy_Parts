import React from 'react';

export type ProfileRecord = {
  id: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  phone: string;
  landline: string;
  country: 'Chile';
  region: string;
  city: string;
  comuna: string;
  postalCode: string;
};

export function useProfile(profileId: string, defaults: Omit<ProfileRecord, 'id'>) {
  const key = `fixsy_profile_${profileId}`;
  const read = React.useCallback((): ProfileRecord => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as ProfileRecord;
    } catch {}
    return { id: profileId, ...defaults } as ProfileRecord;
  }, [key, profileId, defaults]);

  const [profile, setProfile] = React.useState<ProfileRecord>(read);

  const save = React.useCallback((next?: ProfileRecord) => {
    const toSave = next ?? profile;
    try { localStorage.setItem(key, JSON.stringify(toSave)); } catch {}
    if (!next) return;
    setProfile(next);
  }, [key, profile]);

  const update = React.useCallback(<K extends keyof ProfileRecord>(k: K, v: ProfileRecord[K]) => {
    setProfile(prev => {
      const next = { ...prev, [k]: v } as ProfileRecord;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  const setPhoto = React.useCallback((base64: string) => update('profilePic', base64), [update]);

  return { profile, setProfile, save, update, setPhoto } as const;
}
