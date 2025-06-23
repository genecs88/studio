
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import {
  organizations as initialOrganizations,
  apiKeys as initialApiKeys,
  environments as initialEnvironments,
  orgPaths as initialOrgPaths,
  apiActions as initialApiActions,
  users as initialUsers,
} from '@/lib/placeholder-data';
import type { Organization, ApiKey, Environment, OrgPath, ApiAction, User, NewOrganizationData } from '@/lib/placeholder-data';
import { useToast } from '@/hooks/use-toast';

interface FirebaseConfigDetails {
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
}

interface AppDataContextType {
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  connectionStatus: 'connecting' | 'connected' | 'error';
  connectionError: string | null;
  firebaseConfigDetails: FirebaseConfigDetails;
  
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

  addEnvironment: (env: Omit<Environment, 'id' | 'createdAt'>) => Promise<void>;
  updateEnvironment: (env: Environment) => Promise<void>;
  deleteEnvironment: (envId: string) => Promise<void>;

  addOrganization: (org: NewOrganizationData) => Promise<void>;
  updateOrganization: (org: Omit<Organization, 'createdAt'>) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;

  addApiKey: (key: { organizationId: string; environmentId: string; key: string }) => Promise<void>;
  updateApiKey: (key: Omit<ApiKey, 'createdAt'>) => Promise<void>;
  deleteApiKey: (keyId: string) => Promise<void>;
  
  addOrgPath: (path: { organizationId: string; path: string; }) => Promise<void>;
  updateOrgPath: (path: Omit<OrgPath, 'createdAt'>) => Promise<void>;
  deleteOrgPath: (pathId: string) => Promise<void>;

  addApiAction: (action: { key: string; value: string; environmentId: string }) => Promise<void>;
  updateApiAction: (action: Omit<ApiAction, 'createdAt'>) => Promise<void>;
  deleteApiAction: (actionId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const DB_ERROR_MSG = "Database not connected. Check Firebase configuration.";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [firebaseConfigDetails, setFirebaseConfigDetails] = useState<FirebaseConfigDetails>({});

  // State for data fetched from Firestore
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [orgPaths, setOrgPaths] = useState<OrgPath[]>([]);
  const [apiActions, setApiActions] = useState<ApiAction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const { toast } = useToast();

  // Check auth status from sessionStorage on initial client load
  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(storedAuth);
    } catch (error) {
      // sessionStorage is not available in SSR, so we can ignore this error.
    } finally {
      setIsAuthChecked(true);
    }
  }, []);

  // Persist auth state in sessionStorage
  useEffect(() => {
    if (isAuthChecked) {
      try {
        sessionStorage.setItem('isAuthenticated', String(isAuthenticated));
      } catch (error) {
         // sessionStorage is not available in SSR, so we can ignore this error.
      }
    }
  }, [isAuthenticated, isAuthChecked]);
  
  // Set up real-time listeners for all collections and check connection
  useEffect(() => {
    // Reading env variables and setting them to state.
    setFirebaseConfigDetails({
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    if (!db) {
      setConnectionStatus('error');
      setConnectionError("Firebase configuration is missing. Check your .env.local file.");
      return;
    }

    setConnectionStatus('connecting');
    let unsubscribers: Unsubscribe[] = [];

    const initializeAndListen = async () => {
      try {
        // Test connection and seed if necessary
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setConnectionStatus('connected');
        setConnectionError(null);

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
        
        // Now that connection is verified, set up listeners
        unsubscribers.push(onSnapshot(collection(db, 'environments'), snap => setEnvironments(snap.docs.map(d => ({...d.data(), id: d.id } as Environment)))));
        unsubscribers.push(onSnapshot(collection(db, 'organizations'), snap => setOrganizations(snap.docs.map(d => ({...d.data(), id: d.id } as Organization)))));
        unsubscribers.push(onSnapshot(collection(db, 'apiKeys'), snap => setApiKeys(snap.docs.map(d => ({...d.data(), id: d.id } as ApiKey)))));
        unsubscribers.push(onSnapshot(collection(db, 'orgPaths'), snap => setOrgPaths(snap.docs.map(d => ({...d.data(), id: d.id } as OrgPath)))));
        unsubscribers.push(onSnapshot(collection(db, 'apiActions'), snap => setApiActions(snap.docs.map(d => ({...d.data(), id: d.id } as ApiAction)))));
        unsubscribers.push(onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({...d.data(), id: d.id } as User)))));

      } catch (e: any) {
        console.error("Firestore connection/initialization failed:", e);
        setConnectionStatus('error');
        setConnectionError(e.message);
      }
    };
    
    initializeAndListen();

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // CRUD function implementations
  const addUser = async (data: Omit<User, 'id' | 'createdAt'>) => { if (!db) throw new Error(DB_ERROR_MSG); await addDoc(collection(db, 'users'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateUser = async (data: User) => { if (!db) throw new Error(DB_ERROR_MSG); const { id, ...rest } = data; await updateDoc(doc(db, 'users', id), rest) };
  const deleteUser = async (id: string) => { if (!db) throw new Error(DB_ERROR_MSG); await deleteDoc(doc(db, 'users', id)) };
  
  const addEnvironment = async (data: Omit<Environment, 'id' | 'createdAt'>) => { if (!db) throw new Error(DB_ERROR_MSG); await addDoc(collection(db, 'environments'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateEnvironment = async (data: Environment) => { if (!db) throw new Error(DB_ERROR_MSG); const { id, ...rest } = data; await updateDoc(doc(db, 'environments', id), rest) };
  const deleteEnvironment = async (envId: string) => {
    if (!db) throw new Error(DB_ERROR_MSG);
    const batch = writeBatch(db);
    const envToDelete = environments.find(e => e.id === envId);
    if (!envToDelete) {
        toast({ variant: "destructive", title: "Error", description: "Environment not found."});
        return;
    }

    batch.delete(doc(db, 'environments', envId));

    const orgsToDelete = organizations.filter(o => o.environmentId === envId);
    for (const org of orgsToDelete) {
      batch.delete(doc(db, 'organizations', org.id));
      
      const keysToDelete = apiKeys.filter(k => k.organizationId === org.id);
      keysToDelete.forEach(key => batch.delete(doc(db, 'apiKeys', key.id)));

      const pathsToDelete = orgPaths.filter(p => p.organizationId === org.id);
      pathsToDelete.forEach(path => batch.delete(doc(db, 'orgPaths', path.id)));
    }

    const actionsToDelete = apiActions.filter(a => a.environmentId === envId);
    actionsToDelete.forEach(action => batch.delete(doc(db, 'apiActions', action.id)));

    await batch.commit();
    toast({ title: "Success!", description: `Environment "${envToDelete.name}" and all its associated data have been deleted.`});
  };

  const addOrganization = async (data: NewOrganizationData) => {
    if (!db) throw new Error(DB_ERROR_MSG);
    const orgData = {
      ...data,
      studyIdentifiers: data.studyIdentifiers || [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    await addDoc(collection(db, 'organizations'), orgData);
  };
  const updateOrganization = async (data: Omit<Organization, 'createdAt'>) => { if (!db) throw new Error(DB_ERROR_MSG); const { id, ...rest } = data; await updateDoc(doc(db, 'organizations', id), rest) };
  const deleteOrganization = async (orgId: string) => {
    if (!db) throw new Error(DB_ERROR_MSG);
    const batch = writeBatch(db);
    const orgToDelete = organizations.find(o => o.id === orgId);
    if (!orgToDelete) {
      toast({ variant: "destructive", title: "Error", description: "Organization not found."});
      return;
    }
    
    batch.delete(doc(db, 'organizations', orgId));

    const keysToDelete = apiKeys.filter(k => k.organizationId === orgId);
    keysToDelete.forEach(key => batch.delete(doc(db, 'apiKeys', key.id)));
    
    const pathsToDelete = orgPaths.filter(p => p.organizationId === orgId);
    pathsToDelete.forEach(path => batch.delete(doc(db, 'orgPaths', path.id)));
    
    await batch.commit();
    toast({ title: "Success!", description: `Organization "${orgToDelete.name}" and all its associated data have been deleted.`});
  };

  const addApiKey = async (data: { organizationId: string; environmentId: string; key: string }) => {
    if (!db) throw new Error(DB_ERROR_MSG);
    await addDoc(collection(db, 'apiKeys'), {
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    });
  };
  const updateApiKey = async (data: Omit<ApiKey, 'createdAt'>) => {
    if (!db) throw new Error(DB_ERROR_MSG);
    const { id, ...rest } = data;
    await updateDoc(doc(db, 'apiKeys', id), rest);
  };
  const deleteApiKey = async (id: string) => { if (!db) throw new Error(DB_ERROR_MSG); await deleteDoc(doc(db, 'apiKeys', id)) };

  const addOrgPath = async (data: { organizationId: string; path: string; }) => { if (!db) throw new Error(DB_ERROR_MSG); await addDoc(collection(db, 'orgPaths'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateOrgPath = async (data: Omit<OrgPath, 'createdAt'>) => { if (!db) throw new Error(DB_ERROR_MSG); const { id, ...rest } = data; await updateDoc(doc(db, 'orgPaths', id), rest) };
  const deleteOrgPath = async (id: string) => { if (!db) throw new Error(DB_ERROR_MSG); await deleteDoc(doc(db, 'orgPaths', id)) };
  
  const addApiAction = async (data: { key: string; value: string; environmentId: string }) => { if (!db) throw new Error(DB_ERROR_MSG); await addDoc(collection(db, 'apiActions'), { ...data, createdAt: new Date().toISOString().split('T')[0] }) };
  const updateApiAction = async (data: Omit<ApiAction, 'createdAt'>) => { if (!db) throw new Error(DB_ERROR_MSG); const { id, ...rest } = data; await updateDoc(doc(db, 'apiActions', id), rest) };
  const deleteApiAction = async (id: string) => { if (!db) throw new Error(DB_ERROR_MSG); await deleteDoc(doc(db, 'apiActions', id)) };

  const value = {
    isAuthenticated, setIsAuthenticated, isAuthChecked,
    connectionStatus, connectionError, firebaseConfigDetails,
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
