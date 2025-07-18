
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Wrench, Search, ArrowRightLeft, XCircle, FilePenLine, Trash2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Tech Support Tools dashboard. Choose a tool to get started.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <Link href="/admin" className="block hover:no-underline">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription className="mt-1">
                  Manage environments, organizations, and API keys.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
         <Link href="/find-report-v2" className="block hover:no-underline">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle>Find Report V2</CardTitle>
                <CardDescription className="mt-1">
                  A duplicated find report tool.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/transfer-ownership-v2" className="block hover:no-underline">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <ArrowRightLeft className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle>Transfer Ownership V2</CardTitle>
                <CardDescription className="mt-1">
                  Transfer ownership of a report using the Datadog search workflow.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/cancel-report-v2" className="block hover:no-underline">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <XCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle>Cancel Report V2</CardTitle>
                <CardDescription className="mt-1">
                  Cancel a report using the Datadog search workflow.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/delete-report-v2" className="block hover:no-underline">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Trash2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle>Delete Report V2</CardTitle>
                <CardDescription className="mt-1">
                  Delete a report using the Datadog search workflow.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/update-report-v2" className="block hover:no-underline">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FilePenLine className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle>Update Report Status V2</CardTitle>
                <CardDescription className="mt-1">
                  Update the status of a report.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
