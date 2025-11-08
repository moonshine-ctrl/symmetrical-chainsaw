'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { settings, users } from '@/lib/data-supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This should run only on the client after mount
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Redirect if already logged in
      if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        router.replace('/admin/dashboard');
      }
    }
  }, [router, isClient]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const adminUser = users.find(u => u.role === 'Admin');

    if (adminUser && nip === adminUser.nip && password === adminUser.password) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome back, Admin!',
      });
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid NIP or password. Please try again.',
      });
      setIsLoading(false);
    }
  };

  if (!isClient) {
    // You can render a loader here or nothing
    return null;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 gradient-background">
      <Card className="w-full max-w-sm bg-white/30 dark:bg-black/30 backdrop-blur-lg border-white/20 text-gray-800 dark:text-white shadow-2xl rounded-2xl">
        <CardHeader className="text-center pt-8">
            <div className="flex justify-center mb-4">
                <Logo logoUrl={settings.logoUrl} isLogin={true} />
            </div>
          <CardTitle className="text-2xl font-bold font-headline text-slate-800 dark:text-white">Admin Login</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">Access the management dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nip" className="text-slate-700 dark:text-slate-200">NIP</Label>
              <Input
                id="nip"
                type="text"
                placeholder="Masukkan NIP Admin"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
                className="bg-white/50 dark:bg-black/50 border-white/30 dark:border-black/30 focus:ring-pink-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 dark:bg-black/50 border-white/30 dark:border-black/30 focus:ring-pink-500"
              />
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
             </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:underline">
              Login as Employee
            </Link>
        </CardFooter>
      </Card>
      <div className="fixed bottom-4 left-4 text-sm font-headline text-slate-700 dark:text-slate-300">
        Developed by Moonshine⚡
      </div>
    </div>
  );
}
