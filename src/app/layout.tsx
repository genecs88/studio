
"use client";

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Settings,
  Wrench,
  Search,
  ArrowRightLeft,
  XCircle,
} from "lucide-react";
import { AppDataProvider } from '@/context/app-data-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/admin')) return 'Admin Management';
    if (pathname === '/find-report') return 'Find Report';
    if (pathname === '/transfer-ownership') return 'Transfer Ownership';
    if (pathname === '/cancel-report') return 'Cancel Report';
    return 'Tech Support Tools';
  }

  return (
    <html lang="en" className="dark">
      <head>
        <title>{getPageTitle()}</title>
        <meta name="description" content="A suite of tools for tech support." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AppDataProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                      <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-headline font-semibold">Tech Support Tools</h1>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/'}>
                      <Link href="/">
                        <LayoutGrid />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')}>
                      <Link href="/admin">
                        <Wrench />
                        Admin Management
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/find-report'}>
                      <Link href="/find-report">
                        <Search />
                        Find Report
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/transfer-ownership'}>
                      <Link href="/transfer-ownership">
                        <ArrowRightLeft />
                        Transfer Ownership
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/cancel-report'}>
                      <Link href="/cancel-report">
                        <XCircle />
                        Cancel Report
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings />
                      Settings
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter>
                <div className="flex items-center gap-3 p-2">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Admin User</span>
                    <span className="text-xs text-muted-foreground">
                      admin@techsupport.dev
                    </span>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex items-center justify-between p-4 border-b md:justify-end">
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Welcome, Admin!</span>
                </div>
              </header>
              <main className="p-4 md:p-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
