import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganizationsTab from "@/components/admin/organizations-tab";
import ApiKeysTab from "@/components/admin/api-keys-tab";
import EnvironmentsTab from "@/components/admin/environments-tab";
import OrgPathsTab from "@/components/admin/org-paths-tab";
import ApiActionsTab from "@/components/admin/api-actions-tab";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">Access various tools and utilities for tech support.</p>
      </div>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="org-paths">Org Paths</TabsTrigger>
          <TabsTrigger value="api-actions">API Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="organizations">
            <OrganizationsTab />
        </TabsContent>
        <TabsContent value="api-keys">
            <ApiKeysTab />
        </TabsContent>
        <TabsContent value="environments">
            <EnvironmentsTab />
        </TabsContent>
        <TabsContent value="org-paths">
            <OrgPathsTab />
        </TabsContent>
        <TabsContent value="api-actions">
            <ApiActionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
