import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Lock, Mail, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { authService, UserRole } from '@/services/authService';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });

  // Determine role based on query string, default to student
  const role = searchParams.get('role') as UserRole || 'student';

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const user = await authService.login({
      registrationNumber: formData.identifier,
      password: formData.password
    });

    // Store role and id locally
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_name', `${user.first_name} ${user.last_name}`);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.first_name}!`,
    });

    // Navigate AFTER token and user are set
    if (user.role === 'instructor') navigate('/instructor');
    else if (user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/dashboard');

  } catch (error: any) {
    toast({
      title: "Login Failed",
      description: error.message || "Invalid credentials",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-subtle to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card className="shadow-academic-strong">
          <CardHeader className="text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hero-gradient mx-auto">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your MUST Learning Hub account
              </CardDescription>
              <Badge variant="secondary" className="text-xs">
                {role === 'instructor' ? 'Instructor Portal' : 
                 role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </Badge>
            </div>
          </CardHeader>

           <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {role === 'admin' ? 'Email Address' : 
                   role === 'instructor' ? 'Staff Registration Number' : 
                   'Student Registration Number'}
                </Label>
                <div className="relative">
                  {role === 'admin' ? (
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    id="identifier"
                    type={role === 'admin' ? 'email' : 'text'}
                    placeholder={role === 'admin' ? 'admin@must.ac.tz' : 
                                role === 'instructor' ? 'STAFF-2024-001' : 
                                '2024-01-12345'}
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, rememberMe: checked as boolean})
                    }
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Don't have an account?{' '}
                </span>
                <Link 
                  to="/auth/register" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
