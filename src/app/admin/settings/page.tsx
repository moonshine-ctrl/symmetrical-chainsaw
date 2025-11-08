// src/app/admin/settings/page.tsx
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useState, SyntheticEvent, useEffect } from 'react';
import Image from 'next/image';
import type { Department, User } from '@/types';

// IMPORT ASYNC HELPERS (pastikan ada di data-supabase)
import {
  getDepartments,
  getUsers,
  getAppSettings,
  departmentApprovalFlows as staticApprovalFlows,
} from '@/lib/data-supabase';

export default function SettingsPage() {
  const { toast } = useToast();

  // local states for dynamic data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // settings state (fallback until real settings fetched)
  const [sickLeaveFormUrl, setSickLeaveFormUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [letterhead, setLetterhead] = useState<string[]>(['Company Name']);
  const [approvers, setApprovers] = useState<{ [key: string]: (string | null)[] }>({});
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();

  // fetch departments/users/settings on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [deps, us, appSet] = await Promise.all([
          getDepartments(),
          getUsers(),
          getAppSettings()
        ]);
        if (!mounted) return;
        setDepartments(deps || []);
        setUsers(us || []);
        // initialize UI settings using fetched app settings
        setSickLeaveFormUrl(appSet?.sickLeaveFormUrl || '');
        setLogo(appSet?.logoUrl || null);
        setLetterhead(Array.isArray(appSet?.letterhead) ? appSet.letterhead : ['Company Name']);
        // initialize approvers from static config if empty
        setApprovers(prev => {
          const base = { ...prev };
          Object.keys(staticApprovalFlows).forEach(k => {
            base[k] = staticApprovalFlows[k].slice(0, 3).map(id => id ?? null);
          });
          return base;
        });
      } catch (err) {
        console.error('Failed to load settings page data', err);
        toast({ title: 'Load failed', description: 'Gagal memuat data. Cek console.' });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [toast]);

  const handleApproverChange = (deptId: string, level: number, value: string) => {
    setApprovers(prev => {
      const newApprovers = { ...prev };
      if (!newApprovers[deptId]) newApprovers[deptId] = [null, null, null];
      newApprovers[deptId][level - 1] = value === 'none' ? null : value;
      return newApprovers;
    });
  };

  const handleSaveChanges = (e: SyntheticEvent, deptId: string) => {
    e.preventDefault();
    // Simpan ke staticApprovalFlows lokal (atau panggil API/service untuk persist)
    staticApprovalFlows[deptId] = (approvers[deptId] || []).filter(Boolean) as string[];
    toast({
      title: 'Changes Saved!',
      description: `Approval flow for ${deptId} updated.`,
    });
    setActiveAccordionItem(undefined);
  };

  const handleGeneralSave = () => {
    // ideally call updateAppSettings API here
    toast({
      title: 'Changes Saved!',
      description: 'General settings updated locally.',
    });
  };

  const handleBrandingSave = () => {
    // ideally call updateAppSettings API here
    toast({
      title: 'Changes Saved!',
      description: 'Branding updated locally.',
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLetterheadChange = (index: number, value: string) => {
    const newLetterhead = [...letterhead];
    newLetterhead[index] = value;
    setLetterhead(newLetterhead);
  };

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Memuat data...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="approval">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding & Kop Surat</TabsTrigger>
          <TabsTrigger value="approval">Approval Flows</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Atur link eksternal dan konfigurasi umum aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sick-leave-url">URL Google Form Surat Sakit</Label>
                <Input
                  id="sick-leave-url"
                  value={sickLeaveFormUrl}
                  onChange={(e) => setSickLeaveFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/..."
                />
                <p className="text-xs text-muted-foreground">
                  Tautan ini akan digunakan saat karyawan mengajukan cuti sakit.
                </p>
              </div>
              <Button onClick={handleGeneralSave}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Kop Surat</CardTitle>
              <CardDescription>Sesuaikan logo dan teks kop surat untuk semua dokumen yang dicetak.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo Instansi</Label>
                  {logo && (
                    // next/image but ensure domain/data-uri allowed in next config if external
                    <div className="w-20 h-20 relative">
                      <Image src={logo} alt="Current Logo" fill style={{ objectFit: 'contain' }} />
                    </div>
                  )}
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unggah logo yang akan muncul di halaman login dan kop surat.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Teks Kop Surat</Label>
                  {letterhead.map((line, index) => (
                    <Input
                      key={index}
                      value={line}
                      onChange={(e) => handleLetterheadChange(index, e.target.value)}
                      placeholder={`Baris ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleBrandingSave}>Save Branding</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Flow Configuration</CardTitle>
              <CardDescription>Set up 1 to 3 levels of approvers for each department.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                {departments.map((dept) => (
                  <AccordionItem key={dept.id} value={dept.id}>
                    <AccordionTrigger className="text-base font-medium">
                      {dept.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 p-2">
                        {[1, 2, 3].map(level => (
                          <div className="grid gap-3" key={level}>
                            <Label htmlFor={`approver${level}-${dept.id}`}>
                              Approver Level {level}
                            </Label>
                            <Select
                              value={approvers[dept.id]?.[level - 1] || 'none'}
                              onValueChange={(value) => handleApproverChange(dept.id, level, value)}
                            >
                              <SelectTrigger id={`approver${level}-${dept.id}`}>
                                <SelectValue placeholder="Select an approver" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {users.filter(u => u.role !== 'Admin').map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        <Button className="mt-4" onClick={(e) => handleSaveChanges(e, dept.id)}>Save Changes</Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
