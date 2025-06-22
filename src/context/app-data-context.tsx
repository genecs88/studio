
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  organizations as initialOrganizations,
  apiKeys as initialApiKeys,
  environments as initialEnvironments,
  orgPaths as initialOrgPaths,
  apiActions as initialApiActions,
  users as initialUsers,
  type Organization,
  type ApiKey,
  type Environment,
  type OrgPath,
  type ApiAction,
  type User,
} from '@/lib/placeholder-data';

// Helper function to get data from localStorage, with a fallback to default initial data.
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  // localStorage is only available in the browser, so we check for the window object.
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // If the item exists in storage, parse it. Otherwise, return the default.
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

// Helper function to set data in localStorage.
const setInStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
};


interface AppDataContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  environments: Environment[];
  setEnvironments: React.Dispatch<React.SetStateAction<Environment[]>>;
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  apiKeys: ApiKey[];
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKey[]>>;
  orgPaths: OrgPath[];
  setOrgPaths: React.Dispatch<React.SetStateAction<OrgPath[]>>;
  apiActions: ApiAction[];
  setApiActions: React.Dispatch<React.SetStateAction<ApiAction[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or fall back to initial data.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getFromStorage('isAuthenticated', false));
  const [environments, setEnvironments] = useState<Environment[]>(() => getFromStorage('environments', initialEnvironments));
  const [organizations, setOrganizations] = useState<Organization[]>(() => getFromStorage('organizations', initialOrganizations));
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => getFromStorage('apiKeys', initialApiKeys));
  const [orgPaths, setOrgPaths] = useState<OrgPath[]>(() => getFromStorage('orgPaths', initialOrgPaths));
  const [apiActions, setApiActions] = useState<ApiAction[]>(() => getFromStorage('apiActions', initialApiActions));
  const [users, setUsers] = useState<User[]>(() => getFromStorage('users', initialUsers));

  // Use useEffect to save state to localStorage whenever it changes.
  useEffect(() => { setInStorage('isAuthenticated', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { setInStorage('environments', environments); }, [environments]);
  useEffect(() => { setInStorage('organizations', organizations); }, [organizations]);
  useEffect(() => { setInStorage('apiKeys', apiKeys); }, [apiKeys]);
  useEffect(() => { setInStorage('orgPaths', orgPaths); }, [orgPaths]);
  useEffect(() => { setInStorage('apiActions', apiActions); }, [apiActions]);
  useEffect(() => { setInStorage('users', users); }, [users]);


  const value = {
    isAuthenticated,
    setIsAuthenticated,
    environments,
    setEnvironments,
    organizations,
    setOrganizations,
    apiKeys,
    setApiKeys,
    orgPaths,
    setOrgPaths,
    apiActions,
    setApiActions,
    users,
    setUsers,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
