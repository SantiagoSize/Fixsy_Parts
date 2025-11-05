const DEV_LOCAL_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function getRecaptchaKey(): string | null {
  try {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host.includes('localhost') || host === '127.0.0.1') {
      return DEV_LOCAL_KEY;
    }
    const key = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY as string | undefined;
    if (key && key.trim().length > 0) return key.trim();
    return null;
  } catch {
    return null;
  }
}

