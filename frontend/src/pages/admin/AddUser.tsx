import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, GraduationCap, UserCircle } from 'lucide-react';

export default function AddUser() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    program: '',
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "User Added Successfully",
        description: `${formData.firstName} ${formData.lastName} has been added as ${formData.role}.`,
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        program: '',
        status: 'active'
      });
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add New User</h1>
          <p className="text-muted-foreground mt-2">
            Create a new user account for the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@must.ac.tz"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create temporary password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  User will be prompted to change this on first login
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setFormData({...formData, role: value})} required>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Program (if student) */}
              {formData.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="program">Study Program *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select onValueChange={(value) => setFormData({...formData, program: value})} required>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="business">Business Administration</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Account Status *</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating User..." : "Create User"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}