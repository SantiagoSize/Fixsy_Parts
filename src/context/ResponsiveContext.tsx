import React from 'react';

export type ResponsiveState = {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
};

const getSnapshot = (): ResponsiveState => {
  if (typeof window === 'undefined') {
    return { width: 1440, height: 900, isMobile: false, isTablet: false, isDesktop: true, orientation: 'landscape' };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isMobile: width <= 720,
    isTablet: width > 720 && width <= 1080,
    isDesktop: width > 1080,
    orientation: width >= height ? 'landscape' : 'portrait',
  };
};

const ResponsiveContext = React.createContext<ResponsiveState | null>(null);

type Props = { children: React.ReactNode; initialState?: ResponsiveState };

export function ResponsiveProvider({ children, initialState }: Props) {
  const [state, setState] = React.useState<ResponsiveState>(() => initialState || getSnapshot());

  React.useEffect(() => {
    const handleResize = () => setState(getSnapshot());
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsiveContext(): ResponsiveState {
  const ctx = React.useContext(ResponsiveContext);
  if (!ctx) {
    throw new Error('useResponsiveContext debe usarse dentro de ResponsiveProvider');
  }
  return ctx;
}
