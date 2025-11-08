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
import { departments, users, settings as appSettings, departmentApprovalFlows } from '@/lib/data-supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useState, SyntheticEvent } from 'react';
import Image from 'next/image';

export default function SettingsPage() {
  const { toast } = useToast();

  // Gunakan fallback array kosong untuk mencegah crash jika data kosong
  const [sickLeaveFormUrl, setSickLeaveFormUrl] = useState(appSettings.sickLeaveFormUrl || '');
  const [logo, setLogo] = useState(appSettings.logoUrl || '');
  const [letterhead, setLetterhead] = useState(appSettings.letterhead || ['', '', '']);
  const [approvers, setApprovers] = useState<{ [key: string]: (string | null)[] }>(departmentApprovalFlows || {});
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();

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
    departmentApprovalFlows[deptId] = approvers[deptId]?.filter(id => id !== null) as string[];
    toast({
      title: 'Changes Saved!',
      description: `Approval flow for the department has been updated.`,
    });
    setActiveAccordionItem(undefined); // Close accordion
  };

  const handleGeneralSave = () => {
    appSettings.sickLeaveFormUrl = sickLeaveFormUrl;
    toast({
      title: 'Changes Saved!',
      description: 'Your general settings have been updated.',
    });
  };

  const handleBrandingSave = () => {
    appSettings.logoUrl = logo;
    appSettings.letterhead = letterhead;
    toast({
      title: 'Changes Saved!',
      description: 'Branding & letterhead settings updated.',
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLetterheadChange = (index: number, value: string) => {
    const newLetterhead = [...letterhead];
    newLetterhead[index] = value;
    setLetterhead(newLetterhead);
  };

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
                  {logo && <Image src={logo} alt="Current Logo" width={80} height={80} className="rounded-md border p-2" />}
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
                  {letterhead?.map((line, index) => (
                    <Input
                      key={index}
                      value={line || ''}
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
              <CardDescription>
                Set up 1 to 3 levels of approvers for each department.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeAccordionItem}
                onValueChange={setActiveAccordionItem}
              >
                {departments.map((dept) => (
                  <AccordionItem key={dept.id} value={dept.id}>
                    <AccordionTrigger className="text-base font-medium">{dept.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 p-2">
                        {[1, 2, 3].map((level) => (
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
