'use client';

import { useState, useEffect } from 'react';
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
import { MoreHorizontal, PlusCircle, Trash2, Pen } from 'lucide-react';
import { departments as initialDepartments, users as initialUsers } from '@/lib/data-supabase';
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
import type { Department } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Recalculate employee counts on component mount and when users might change
  useEffect(() => {
    const departmentCounts = initialUsers.reduce((acc, user) => {
        acc[user.departmentId] = (acc[user.departmentId] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const updatedDepartments = initialDepartments.map(dept => ({
        ...dept,
        employeeCount: departmentCounts[dept.id] || 0,
    }));
    setDepartments(updatedDepartments);
  }, []); // Re-run if users array could change from an external source in a real app

  const handleAddDepartment = () => {
    if (newDeptName) {
      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        name: newDeptName,
        employeeCount: 0,
      };
      const updatedDepartments = [...departments, newDepartment];
      setDepartments(updatedDepartments);
      // Also update the global/mock data so it reflects on settings page
      initialDepartments.push(newDepartment); 
      setOpen(false);
      setNewDeptName('');
      toast({
        title: 'Department Added',
        description: `${newDepartment.name} has been created.`,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Department name is required.',
        });
    }
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment({ ...department });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDepartment = () => {
    if (editingDepartment) {
      const updatedDepartments = departments.map(d => d.id === editingDepartment.id ? editingDepartment : d);
      setDepartments(updatedDepartments);

      // Also update the global/mock data
      const index = initialDepartments.findIndex(d => d.id === editingDepartment.id);
      if (index !== -1) {
        initialDepartments[index] = editingDepartment;
      }

      setIsEditDialogOpen(false);
      setEditingDepartment(null);
      toast({
        title: 'Department Updated',
        description: 'Changes have been saved successfully.',
      });
    }
  };
  
  const handleDepartmentChange = (field: keyof Department, value: string) => {
    if (editingDepartment) {
      setEditingDepartment({ ...editingDepartment, [field]: value });
    }
  }

  const handleDeleteDepartment = (departmentId: string) => {
    // Check if any user is in this department
    const usersInDept = initialUsers.filter(u => u.departmentId === departmentId).length;
    if (usersInDept > 0) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'Cannot delete a department that has employees.',
        });
        return;
    }

    const updatedDepartments = departments.filter(d => d.id !== departmentId);
    setDepartments(updatedDepartments);
    
    const index = initialDepartments.findIndex(d => d.id === departmentId);
    if (index !== -1) {
      initialDepartments.splice(index, 1);
    }
    
    toast({
      title: 'Department Deleted',
      description: 'The department has been removed.',
    });
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddDepartment} variant="default">Add Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            Organize your institution by creating and managing departments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => {
                return (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.employeeCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(department)}>
                            <Pen className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteDepartment(department.id)}>
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

      {editingDepartment && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input id="edit-name" value={editingDepartment.name} onChange={(e) => handleDepartmentChange('name', e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateDepartment} variant="default">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
