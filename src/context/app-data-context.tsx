
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
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
  type NewOrganizationData,
} from '@/lib/placeholder-data';

interface AppDataContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Data from Firestore
  environments: Environment[];
  organizations: Organization[];
  apiKeys: ApiKey[];
  orgPaths: OrgPath[];
  apiActions: ApiAction[];
  users: User[];

  // CRUD Functions
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  addEnvironment: (env: Omit<Environment, 'id'>) => Promise<void>;
  updateEnvironment: (env: Environment) => Promise<void>;
  deleteEnvironment: (envId: string) => Promise<void>;

  addOrganization: (org: NewOrganizationData) => Promise<void>;
  updateOrganization: (org: Omit<Organization, 'createdAt'>) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;

  addApiKey: (key: { organizationId: string; environmentId: string; key: string }) => Promise<void>;
  updateApiKey: (key: Omit<ApiKey, 'createdAt' | 'organization' | 'environment'> & { organizationId: string; environmentId: string }) => Promise<void>;
  deleteApiKey: (keyId: string) => Promise<void>;
  
  addOrgPath: (path: { organizationId: string; path: string; }) => Promise<void>;
  updateOrgPath: (path: Omit<OrgPath, 'createdAt'>) => Promise<void>;
  deleteOrgPath: (pathId: string) => Promise<void>;

  addApiAction: (action: { key: string; value: string; environmentId: string }) => Promise<void>;
  updateApiAction: (action: Omit<ApiAction, 'createdAt'>) => Promise<void>;
  deleteApiAction: (actionId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Use sessionStorage for auth state to persist through reloads but clear on session end.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('isAuthenticated') === 'true';
  });

  // State for data fetched from Firestore
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [orgPaths, setOrgPaths] = useState<OrgPath[]>([]);
  const [apiActions, setApiActions] = useState<ApiAction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Persist auth state in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isAuthenticated', String(isAuthenticated));
    }
  }, [isAuthenticated]);
  
  // Seed database with initial data if it's empty
  useEffect(() => {
    const seedDatabase = async () => {
      // Only run seeding if db is available
      if (!db) return;
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        if (usersSnapshot.empty) {
          console.log('Database appears empty, seeding with initial data...');
          const batch = writeBatch(db);

          initialEnvironments.forEach(item => batch.set(doc(db, 'environments', item.id), item));
          initialOrganizations.forEach(item => batch.set(doc(db, 'organizations', item.id), item));
          initialApiKeys.forEach(item => batch.set(doc(db, 'apiKeys', item.id), item));
          initialOrgPaths.forEach(item => batch.set(doc(db, 'orgPaths', item.id), item));
          initialApiActions.forEach(item => batch.set(doc(db, 'apiActions', item.id), item));
          initialUsers.forEach(item => batch.set(doc(db, 'users', item.id), item));

          await batch.commit();
          console.log('Database seeded successfully.');
        }
      } catch (error) {
        console.error("Error seeding database:", error);
      }
    };
    seedDatabase();
  }, []);

  // Set up real-time listeners for all collections
  useEffect(() => {
    // Only set up listeners if db is available
    if (!db) return;

    const unsubEnvironments = onSnapshot(collection(db, 'environments'), snap => setEnvironments(snap.docs.map(d => ({...d.data(), id: d.id } as Environment))));
    const unsubOrganizations = onSnapshot(collection(db, 'organizations'), snap => setOrganizations(snap.docs.map(d => ({...d.data(), id: d.id } as Organization))));
    const unsubApiKeys = onSnapshot(collection(db, 'apiKeys'), snap => setApiKeys(snap.docs.map(d => ({...d.data(), id: d.id } as ApiKey))));
    const unsubOrgPaths = onSnapshot(collection(db, 'orgPaths'), snap => setOrgPaths(snap.docs.map(d => ({...d.data(), id: d.id } as OrgPath))));
    const unsubApiActions = onSnapshot(collection(db, 'apiActions'), snap => setApiActions(snap.docs.map(d => ({...d.data(), id: d.id } as ApiAction))));
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({...d.data(), id: d.id } as User))));

    return () => {
      unsubEnvironments();
      unsubOrganizations();
      unsubApiKeys();
      unsubOrgPaths();
      unsubApiActions();
      unsubUsers();
    };
  }, []);

  // CRUD function implementations
  const addUser = async (data: Omit<User, 'id' | 'createdAt'>) => { if (db) await addDoc(collection(db, 'users'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateUser = async (data: User) => { if (db) await updateDoc(doc(db, 'users', data.id), { ...data }) };
  const deleteUser = async (id: string) => { if (db) await deleteDoc(doc(db, 'users', id)) };
  
  const addEnvironment = async (data: Omit<Environment, 'id'>) => { if (db) await addDoc(collection(db, 'environments'), data) };
  const updateEnvironment = async (data: Environment) => { if (db) await updateDoc(doc(db, 'environments', data.id), { ...data }) };
  const deleteEnvironment = async (id: string) => { if (db) await deleteDoc(doc(db, 'environments', id)) };

  const addOrganization = async (data: NewOrganizationData) => { if (db) await addDoc(collection(db, 'organizations'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateOrganization = async (data: Omit<Organization, 'createdAt'>) => { if (db) await updateDoc(doc(db, 'organizations', data.id), { ...data }) };
  const deleteOrganization = async (id: string) => { if (db) await deleteDoc(doc(db, 'organizations', id)) };

  const addApiKey = async (data: { organizationId: string; environmentId: string; key: string }) => {
    if (!db) return;
    const org = organizations.find(o => o.id === data.organizationId);
    const env = environments.find(e => e.id === data.environmentId);
    if(org && env) {
      await addDoc(collection(db, 'apiKeys'), {
        key: data.key,
        organization: org.name,
        environment: env.name,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
  };
  const updateApiKey = async (data: Omit<ApiKey, 'createdAt' | 'organization' | 'environment'> & { organizationId: string; environmentId: string }) => {
    if (!db) return;
    const org = organizations.find(o => o.id === data.organizationId);
    const env = environments.find(e => e.id === data.environmentId);
    if(org && env) {
      await updateDoc(doc(db, 'apiKeys', data.id), { 
        key: data.key,
        organization: org.name,
        environment: env.name,
       });
    }
  };
  const deleteApiKey = async (id: string) => { if (db) await deleteDoc(doc(db, 'apiKeys', id)) };

  const addOrgPath = async (data: { organizationId: string; path: string; }) => { if (db) await addDoc(collection(db, 'orgPaths'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateOrgPath = async (data: Omit<OrgPath, 'createdAt'>) => { if (db) await updateDoc(doc(db, 'orgPaths', data.id), { ...data }) };
  const deleteOrgPath = async (id: string) => { if (db) await deleteDoc(doc(db, 'orgPaths', id)) };
  
  const addApiAction = async (data: { key: string; value: string; environmentId: string }) => { if (db) await addDoc(collection(db, 'apiActions'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateApiAction = async (data: Omit<ApiAction, 'createdAt'>) => { if (db) await updateDoc(doc(db, 'apiActions', data.id), { ...data }) };
  const deleteApiAction = async (id: string) => { if (db) await deleteDoc(doc(db, 'apiActions', id)) };

  const value = {
    isAuthenticated, setIsAuthenticated,
    environments, organizations, apiKeys, orgPaths, apiActions, users,
    addUser, updateUser, deleteUser,
    addEnvironment, updateEnvironment, deleteEnvironment,
    addOrganization, updateOrganization, deleteOrganization,
    addApiKey, updateApiKey, deleteApiKey,
    addOrgPath, updateOrgPath, deleteOrgPath,
    addApiAction, updateApiAction, deleteApiAction,
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
