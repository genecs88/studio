
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect } from 'react';
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
  Wrench,
  Search,
  ArrowRightLeft,
  XCircle,
  FilePenLine,
  LogOut,
} from "lucide-react";
import { AppDataProvider, useAppData } from '@/context/app-data-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, connectionStatus, connectionError } = useAppData();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    router.push('/login');
  };

  const getPageTitle = () => {
    if (pathname === '/login') return 'Login';
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/admin')) return 'Admin Management';
    if (pathname === '/find-report') return 'Find Report';
    if (pathname === '/transfer-ownership') return 'Transfer Ownership';
    if (pathname === '/cancel-report') return 'Cancel Report';
    if (pathname === '/update-report') return 'Update Report Status';
    return 'Tech Support Tools';
  };

  // Render only children for the login page, or if the user is not yet authenticated
  // to prevent the main layout from flashing before the redirect happens.
  if (pathname === '/login' || !isAuthenticated) {
    return (
      <>
        <head>
          <title>{getPageTitle()}</title>
        </head>
        {children}
      </>
    );
  }

  return (
    <>
      <head>
        <title>{getPageTitle()}</title>
        <meta name="description" content="A suite of tools for tech support." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
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
                <SidebarMenuButton asChild isActive={pathname === '/update-report'}>
                  <Link href="/update-report">
                    <FilePenLine />
                    Update Report Status
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-start gap-3 p-2 w-full h-auto text-left">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/40x40.png" alt="@user" data-ai-hint="avatar" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">Admin User</span>
                      <span className="text-xs text-muted-foreground">
                        admin@techsupport.dev
                      </span>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                  <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={cn("h-2.5 w-2.5 rounded-full",
                        connectionStatus === 'connected' && 'bg-green-500',
                        connectionStatus === 'connecting' && 'bg-yellow-500 animate-pulse',
                        connectionStatus === 'error' && 'bg-red-500'
                      )} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {connectionStatus === 'connected' && 'Connected to Firestore'}
                        {connectionStatus === 'connecting' && 'Connecting to Firestore...'}
                        {connectionStatus === 'error' && `Connection failed: ${connectionError}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-sm text-muted-foreground">Welcome, Admin!</span>
              </div>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AppDataProvider>
          <AppContent>{children}</AppContent>
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
