
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminManagementMovedPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Page Not Found</CardTitle>
                <CardDescription>This page has been moved.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-4">The page you are looking for is now located at `/admin`.</p>
                <Button asChild>
                    <Link href="/admin">Go to Admin Management</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
