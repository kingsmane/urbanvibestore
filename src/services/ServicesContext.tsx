import React, { createContext, useContext } from 'react';
import type { Services } from './types';

const ServicesContext = createContext<Services | null>(null);

export const ServicesProvider: React.FC<{ services: Services; children: React.ReactNode }> = ({
  services,
  children,
}) => <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices harus dipakai di dalam <ServicesProvider>.');
  return ctx;
}
