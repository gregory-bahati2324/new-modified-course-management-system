import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        email,
        password,
        role: 'admin',
      });

      if (response.user.role === 'admin') {
        localStorage.setItem('user_role', response.user.role);
        localStorage.setItem('user_id', response.user.id);
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Unauthorized: Admin access required');
      }
    } catch (error) {
      toast.error('Invalid credentials or unauthorized access');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4 text-white hover:bg-white/10"
          asChild
        >
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-base">
                Secure access to MUST LMS Administration
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Administrator Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@must.ac.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Access Admin Portal'}
              </Button>

              <div className="rounded-lg bg-muted/50 p-4 mt-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Demo Admin Credentials:
                </p>
                <p className="text-sm font-mono">
                  Email: <span className="text-primary font-semibold">admin@must.ac.tz</span>
                </p>
                <p className="text-sm font-mono">
                  Password: <span className="text-primary font-semibold">admin123</span>
                </p>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground">
                  This is a secure administrative area. Unauthorized access attempts are logged.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            Not an administrator?{' '}
            <Link to="/auth/login" className="font-semibold text-white hover:underline">
              Go to regular login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
