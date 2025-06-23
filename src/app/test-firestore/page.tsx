
'use client';

import { useState } from 'react';
import { useAppData } from '@/context/app-data-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function TestFirestorePage() {
  const { addUser } = useAppData();
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserCreationTest = async () => {
    setIsLoading(true);
    setResponse('');
    try {
      await addUser({
        name: 'dummy',
        email: 'test@testy.com',
        password: '123456789',
      });
      setResponse('Successfully created dummy user! Check the Users tab in Admin Management to verify.');
    } catch (error: any) {
      setResponse(`Error creating user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Test Connection to Firestore
        </h1>
        <p className="text-muted-foreground">
          This tool attempts to create a dummy user to verify the write connection to the Firestore database.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Creation Test</CardTitle>
          <CardDescription>
            Click the button below to attempt to create a user with the following details:
            <br />
            - Name: "dummy"
            <br />
            - Email: "test@testy.com"
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label htmlFor="response-box">Connection Response</Label>
                <Textarea
                    id="response-box"
                    readOnly
                    value={response}
                    placeholder="Results of the connection test will be displayed here."
                    rows={8}
                    className="font-mono"
                />
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUserCreationTest} disabled={isLoading}>
            {isLoading ? 'Attempting...' : 'Attempt User Creation Test'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
