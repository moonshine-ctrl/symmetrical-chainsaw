'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, QrCode, Trash2, UserPen, X } from 'lucide-react';
import { users as initialUsers, departments as initialDepartments, getDepartmentById } from '@/lib/data-supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { differenceInYears, differenceInMonths, format } from 'date-fns';


const updateDepartmentCount = (departmentId: string, amount: number) => {
    const dept = initialDepartments.find(d => d.id === departmentId);
    if (dept) {
        // Ensure employeeCount doesn't go below zero
        dept.employeeCount = Math.max(0, dept.employeeCount + amount);
    }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [departments, setDepartments] = useState(initialDepartments);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    nip: '',
    password: '',
    departmentId: '',
    role: 'Employee',
    annualLeaveBalance: 12,
    qrCodeSignature: '',
    phone: '',
    golongan: '',
    joinDate: new Date(),
  });

  const handleInputChange = (field: string, value: string, isEditing: boolean = false) => {
    const target = isEditing ? editingUser : newUser;
    const setter = isEditing ? setEditingUser : setNewUser;

    if (field === 'qrCodeSignature') {
        const input = event?.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setter({ ...target!, [field]: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    } else if (field === 'joinDate') {
        setter({ ...target!, [field]: new Date(value) });
    }
    else {
        setter({ ...target!, [field]: value });
    }
  };
  
  const handleSelectChange = (field: string, value: 'Admin' | 'Employee' | string, isEditing: boolean = false) => {
    const target = isEditing ? editingUser : newUser;
    const setter = isEditing ? setEditingUser : setNewUser;
    setter({ ...target!, [field]: value });
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.nip && newUser.departmentId && newUser.role && newUser.password) {
      const user: User = {
        id: `user-${Date.now()}`,
        name: newUser.name,
        nip: newUser.nip,
        password: newUser.password,
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
        departmentId: newUser.departmentId,
        role: newUser.role as User['role'],
        annualLeaveBalance: Number(newUser.annualLeaveBalance),
        qrCodeSignature: newUser.qrCodeSignature,
        phone: newUser.phone,
        golongan: newUser.golongan,
        joinDate: newUser.joinDate
      };
      const updatedUsers = [...users, user];
      setUsers(updatedUsers);
      initialUsers.push(user); // Update mock data

      // Update department count
      updateDepartmentCount(user.departmentId, 1);

      setOpen(false);
      setNewUser({
        name: '',
        nip: '',
        password: '',
        departmentId: '',
        role: 'Employee',
        annualLeaveBalance: 12,
        qrCodeSignature: '',
        phone: '',
        golongan: '',
        joinDate: new Date(),
      });
      toast({
        title: 'User Added',
        description: `${user.name} has been added successfully.`,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please fill all required fields, including password.',
        });
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      const originalUser = users.find(u => u.id === editingUser.id);

      const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u)
      setUsers(updatedUsers);

      const index = initialUsers.findIndex(u => u.id === editingUser.id);
      if (index !== -1) {
        initialUsers[index] = editingUser;
      }
      
      // Update department counts if department changed
      if (originalUser && originalUser.departmentId !== editingUser.departmentId) {
          updateDepartmentCount(originalUser.departmentId, -1);
          updateDepartmentCount(editingUser.departmentId, 1);
      }

      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: 'User Updated',
        description: 'User information has been saved.',
      });
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);

    const index = initialUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      initialUsers.splice(index, 1);
    }
    
    // Update department count
    updateDepartmentCount(userToDelete.departmentId, -1);
    
    toast({
      title: 'User Deleted',
      description: 'The user has been removed.',
    });
  }

  const calculateMasaKerja = (joinDate?: Date): string => {
    if (!joinDate) return 'N/A';
    const now = new Date();
    const years = differenceInYears(now, joinDate);
    const months = differenceInMonths(now, joinDate) % 12;
    if (years > 0) {
        return `${years} tahun, ${months} bulan`;
    }
    return `${months} bulan`;
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newUser.name} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nip" className="text-right">NIP</Label>
                <Input id="nip" value={newUser.nip} onChange={(e) => handleInputChange('nip', e.target.value)} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-add" className="text-right">Password</Label>
                <Input id="password-add" type="password" value={newUser.password} onChange={(e) => handleInputChange('password', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" value={newUser.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="golongan" className="text-right">Gol. Ruang</Label>
                <Input id="golongan" value={newUser.golongan} onChange={(e) => handleInputChange('golongan', e.target.value)} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="joinDate" className="text-right">Tgl. Masuk</Label>
                <Input id="joinDate" type="date" onChange={(e) => handleInputChange('joinDate', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                 <Select onValueChange={(value) => handleSelectChange('departmentId', value)} value={newUser.departmentId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                 <Select onValueChange={(value: 'Admin' | 'Employee') => handleSelectChange('role', value)} value={newUser.role}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leave" className="text-right">Leave Balance</Label>
                <Input id="leave" type="number" value={newUser.annualLeaveBalance} onChange={(e) => handleInputChange('annualLeaveBalance', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qr-code" className="text-right">TTD QR Code</Label>
                <Input id="qr-code" type="file" accept="image/png, image/jpeg" onChange={(e) => handleInputChange('qrCodeSignature', '')} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser} variant="default">Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage all employee and administrator accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden lg:table-cell">Role</TableHead>
                <TableHead className="hidden sm:table-cell">Masa Kerja</TableHead>
                <TableHead>Leave Balance</TableHead>
                <TableHead className="hidden md:table-cell">TTD QR Code</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const department = getDepartmentById(user.departmentId);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile person" />
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground hidden md:inline">{user.nip}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {department?.name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{user.role}</TableCell>
                    <TableCell className="hidden sm:table-cell">{calculateMasaKerja(user.joinDate)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{user.annualLeaveBalance}</span> days
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      {user.qrCodeSignature ? (
                        <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                          <QrCode className="h-4 w-4" />
                          <span>Uploaded</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-2 w-fit">
                           <X className="h-4 w-4" />
                          <span>Not Set</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(user)}>
                            <UserPen className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {editingUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" value={editingUser.name} onChange={(e) => handleInputChange('name', e.target.value, true)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nip" className="text-right">NIP</Label>
                <Input id="edit-nip" value={editingUser.nip} onChange={(e) => handleInputChange('nip', e.target.value, true)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">Password</Label>
                <Input id="edit-password" type="password" value={editingUser.password} onChange={(e) => handleInputChange('password', e.target.value, true)} className="col-span-3" placeholder="Kosongkan jika tidak ingin mengubah" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                <Input id="edit-phone" value={editingUser.phone} onChange={(e) => handleInputChange('phone', e.target.value, true)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-golongan" className="text-right">Gol. Ruang</Label>
                <Input id="edit-golongan" value={editingUser.golongan} onChange={(e) => handleInputChange('golongan', e.target.value, true)} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-joinDate" className="text-right">Tgl. Masuk</Label>
                <Input id="edit-joinDate" type="date" value={editingUser.joinDate ? format(new Date(editingUser.joinDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleInputChange('joinDate', e.target.value, true)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">Department</Label>
                 <Select onValueChange={(value) => handleSelectChange('departmentId', value, true)} value={editingUser.departmentId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">Role</Label>
                 <Select onValueChange={(value: 'Admin' | 'Employee') => handleSelectChange('role', value, true)} value={editingUser.role}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-leave" className="text-right">Leave Balance</Label>
                <Input id="edit-leave" type="number" value={editingUser.annualLeaveBalance} onChange={(e) => handleInputChange('annualLeaveBalance', e.target.value, true)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-qr-code" className="text-right">TTD QR Code</Label>
                <Input id="edit-qr-code" type="file" accept="image/png, image/jpeg" onChange={(e) => handleInputChange('qrCodeSignature', '', true)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateUser} variant="default">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
