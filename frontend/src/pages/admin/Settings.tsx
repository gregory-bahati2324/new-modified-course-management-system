import { useState, useEffect } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { adminService, SystemSettings } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load system settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      toast({
        title: 'Success',
        description: 'System settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and features</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {settings.maintenance_mode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            The platform is currently in maintenance mode. Only administrators can access the system.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) =>
                    setSettings({ ...settings, site_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_url">Site URL</Label>
                <Input
                  id="site_url"
                  type="url"
                  value={settings.site_url}
                  onChange={(e) =>
                    setSettings({ ...settings, site_url: e.target.value })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to administrators only
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenance_mode: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Configure user registration and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Permit new users to register on the platform
                  </p>
                </div>
                <Switch
                  checked={settings.allow_registrations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allow_registrations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch
                  checked={settings.require_email_verification}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, require_email_verification: checked })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    session_timeout_minutes: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Users will be logged out after this period of inactivity
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Course Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Course Settings</CardTitle>
            <CardDescription>Configure course-related features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Certificates</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow certificate generation for completed courses
                  </p>
                </div>
                <Switch
                  checked={settings.enable_certificates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_certificates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Forums</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable discussion forums for courses
                  </p>
                </div>
                <Switch
                  checked={settings.enable_forums}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_forums: checked })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="default_duration">Default Course Duration (weeks)</Label>
              <Input
                id="default_duration"
                type="number"
                value={settings.default_course_duration_weeks}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_course_duration_weeks: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload Settings</CardTitle>
            <CardDescription>Configure file upload limits and restrictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="max_file_size">Maximum File Upload Size (MB)</Label>
              <Input
                id="max_file_size"
                type="number"
                value={settings.max_file_upload_mb}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    max_file_upload_mb: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Maximum size for individual file uploads
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AdminLayout>
  );
}
