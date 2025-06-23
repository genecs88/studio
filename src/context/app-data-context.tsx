
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [environments, setEnvironments] = useState<Environment[]>(initialEnvironments);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [orgPaths, setOrgPaths] = useState<OrgPath[]>(initialOrgPaths);
  const [apiActions, setApiActions] = useState<ApiAction[]>(initialApiActions);
  const [users, setUsers] = useState<User[]>(initialUsers);

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
