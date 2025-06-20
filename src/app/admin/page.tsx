import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganizationsTab from "@/components/admin/organizations-tab";
import ApiKeysTab from "@/components/admin/api-keys-tab";
import EnvironmentsTab from "@/components/admin/environments-tab";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">Manage your organizations, API keys, and environments.</p>
      </div>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
