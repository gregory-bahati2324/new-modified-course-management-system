import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, GraduationCap, Hash, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authService, UserRole } from '@/services/authService'; // <-- Import your authService

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    registrationNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    acceptTerms: false,
    acceptPrivacy: false,
    newsletter: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Frontend validation ---
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      toast({
        title: "Agreement Required",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.role) {
      toast({
        title: "Role Required",
        description: "Please select your role (Student or Instructor).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // --- Prepare data for backend ---
      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        registrationNumber : formData.registrationNumber,
        password: formData.password,
        newsletter: formData.newsletter,
        role: formData.role as UserRole // or dynamically choose based on program
      };

      // --- Call backend via authService ---
      const user = await authService.register(registrationData);

      toast({
        title: "Registration Successful!",
        description: `Welcome ${user.first_name}! Please check your email to verify your account.`,
      });

      // --- Navigate to login page after successful registration ---
      navigate('/auth/login');

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.detail || error.message || "Something went wrong.",
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
              <CardTitle className="text-2xl">Join MUST</CardTitle>
              <CardDescription>
                Create your account and start learning today
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
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
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Registration number */}
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">
                  {formData.role === 'student' ? 'Student Registration Number' : 
                   formData.role === 'instructor' ? 'Staff Registration Number' : 
                   'Registration Number'} *
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="registrationNumber"
                    type="text"
                    placeholder={formData.role === 'student' ? 'e.g., 2024-01-12345' : 
                                formData.role === 'instructor' ? 'e.g., STAFF-2024-001' : 
                                'Enter your registration number'}
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.role === 'student' 
                    ? 'Your unique student registration number' 
                    : formData.role === 'instructor'
                    ? 'Your staff registration number'
                    : 'This will be your unique identifier'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am registering as *</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setFormData({...formData, role: value})} required>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>             

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, acceptTerms: checked as boolean})
                    }
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-5">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.acceptPrivacy}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, acceptPrivacy: checked as boolean})
                    }
                    required
                  />
                  <Label htmlFor="privacy" className="text-sm leading-5">
                    I agree to the{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, newsletter: checked as boolean})
                    }
                  />
                  <Label htmlFor="newsletter" className="text-sm leading-5">
                    Send me course updates and learning tips
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{' '}
              </span>
              <Link 
                to="/auth/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
