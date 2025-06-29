
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/app-data-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const {
    setIsAuthenticated,
    users,
    connectionStatus,
    connectionError,
    firebaseConfigDetails,
  } = useAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      setIsAuthenticated(true);
      router.push('/');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const isConnecting = connectionStatus === 'connecting';
  const hasConnectionError = connectionStatus === 'error';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 p-3 rounded-lg bg-primary/10">
                <Wrench className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Tech Support Tools</h1>
            <p className="text-muted-foreground">Please log in to continue</p>
        </div>
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasConnectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}
              {isConnecting && (
                <Alert>
                  <AlertCircle className="h-4 w-4 animate-spin" />
                  <AlertTitle>Connecting...</AlertTitle>
                  <AlertDescription>
                    <p>Attempting to connect to the database. Please wait.</p>
                    {firebaseConfigDetails.projectId && (
                        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground font-mono break-all">
                            <p>Project ID: {firebaseConfigDetails.projectId}</p>
                            <p>Auth Domain: {firebaseConfigDetails.authDomain}</p>
                            <p>Storage Bucket: {firebaseConfigDetails.storageBucket}</p>
                            <p>Messaging Sender ID: {firebaseConfigDetails.messagingSenderId}</p>
                            <p>App ID: {firebaseConfigDetails.appId}</p>
                        </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@techsupport.dev"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isConnecting || hasConnectionError}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isConnecting || hasConnectionError}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isConnecting || hasConnectionError}>
                {isConnecting ? 'Connecting...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
