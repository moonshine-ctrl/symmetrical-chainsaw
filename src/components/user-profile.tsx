import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { users } from '@/lib/data-supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function UserProfile() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  
  useEffect(() => {
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    // This logic determines the user based on the route structure or session.
    if (pathname.startsWith('/admin')) {
      setCurrentUser(users.find(u => u.role === 'Admin'));
    } else if (pathname.startsWith('/employee')) {
       const user = users.find(u => u.id === (loggedInUserId || '1')); // Fallback to '1' if not in session
       setCurrentUser(user);
    }
  }, [pathname]);

  const handleLogout = () => {
    if (currentUser?.role === 'Admin') {
      sessionStorage.removeItem('adminLoggedIn');
      router.push('/admin-login');
    } else {
      sessionStorage.removeItem('employeeLoggedIn');
      sessionStorage.removeItem('loggedInUserId');
      router.push('/login');
    }
  };

  if (!currentUser) return null;

  const profileName = currentUser.name || 'User';
  const profileAvatar = currentUser.avatar || 'https://picsum.photos/seed/user/100/100';
  const profileLink = currentUser.role === 'Admin' ? '/admin/settings' : '#'; // Employee profile page doesn't exist yet

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage
                        src={profileAvatar}
                        alt={profileName}
                        data-ai-hint="profile person"
                    />
                    <AvatarFallback>{profileName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel className='flex flex-col'>
                <span>My Account</span>
                <span className='text-xs text-muted-foreground font-normal'>{profileName}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={profileLink}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
