"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganizationsTab from "@/components/admin/organizations-tab";
import ApiKeysTab from "@/components/admin/api-keys-tab";
import EnvironmentsTab from "@/components/admin/environments-tab";
import OrgPathsTab from "@/components/admin/org-paths-tab";
import ApiActionsTab from "@/components/admin/api-actions-tab";
import {
  organizations as initialOrganizations,
  apiKeys as initialApiKeys,
  environments as initialEnvironments,
  orgPaths as initialOrgPaths,
  apiActions as initialApiActions,
  type Organization,
  type ApiKey,
  type Environment,
  type OrgPath,
  type ApiAction,
} from "@/lib/placeholder-data";


export default function AdminDashboard() {
  const [environments, setEnvironments] = useState<Environment[]>(initialEnvironments);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [orgPaths, setOrgPaths] = useState<OrgPath[]>(initialOrgPaths);
  const [apiActions, setApiActions] = useState<ApiAction[]>(initialApiActions);

  const handleUpdateEnvironment = (updatedEnv: Environment) => {
    setEnvironments(envs => envs.map(env => env.id === updatedEnv.id ? updatedEnv : env));
  };

  const handleUpdateOrganization = (updatedOrg: Organization) => {
    setOrganizations(orgs => orgs.map(org => org.id === updatedOrg.id ? updatedOrg : org));
  };

  const handleUpdateApiKey = (updatedApiKey: ApiKey) => {
    setApiKeys(keys => keys.map(key => key.id === updatedApiKey.id ? updatedApiKey : key));
  };

  const handleUpdateOrgPath = (updatedOrgPath: OrgPath) => {
    setOrgPaths(paths => paths.map(path => path.id === updatedOrgPath.id ? updatedOrgPath : path));
  };
  
  const handleUpdateApiAction = (updatedApiAction: ApiAction) => {
    setApiActions(actions => actions.map(action => action.id === updatedApiAction.id ? updatedApiAction : action));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">Access various tools and utilities for tech support.</p>
      </div>

      <Tabs defaultValue="environments" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="org-paths">Org Paths</TabsTrigger>
          <TabsTrigger value="api-actions">API Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="environments">
            <EnvironmentsTab 
              environments={environments}
              setEnvironments={setEnvironments}
              onEnvironmentUpdated={handleUpdateEnvironment}
            />
        </TabsContent>
        <TabsContent value="organizations">
            <OrganizationsTab
              organizations={organizations}
              setOrganizations={setOrganizations}
              environments={environments}
              onOrganizationUpdated={handleUpdateOrganization}
            />
        </TabsContent>
        <TabsContent value="api-keys">
            <ApiKeysTab
              apiKeys={apiKeys}
              setApiKeys={setApiKeys}
              organizations={organizations}
              environments={environments}
              onApiKeyUpdated={handleUpdateApiKey}
            />
        </TabsContent>
        <TabsContent value="org-paths">
            <OrgPathsTab
              orgPaths={orgPaths}
              setOrgPaths={setOrgPaths}
              organizations={organizations}
              environments={environments}
              onOrgPathUpdated={handleUpdateOrgPath}
            />
        </TabsContent>
        <TabsContent value="api-actions">
            <ApiActionsTab 
              apiActions={apiActions}
              setApiActions={setApiActions}
              environments={environments}
              onApiActionUpdated={handleUpdateApiAction}
            />
        </TabsContent>
      </Tabs>
    </div>
  )
}
