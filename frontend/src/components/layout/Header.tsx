import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, User, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    avatar?: string;
  };
}

export function Header({ isAuthenticated = false, user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-hero-gradient">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">MUST</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Learning Hub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/courses">Courses</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar">Calendar</Link>
              </Button>
              {user?.role === 'instructor' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/instructor">Teach</Link>
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
            </nav>
          )}
        </div>

        {/* Search Bar - Desktop */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses, materials..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                English
              </DropdownMenuItem>
              <DropdownMenuItem>
                Kiswahili
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 px-1 min-w-0 h-5 text-xs">
                      3
                    </Badge>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">New course available</p>
                      <p className="text-xs text-muted-foreground">Advanced React Development is now live</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Assignment due tomorrow</p>
                      <p className="text-xs text-muted-foreground">Database Design Project - submit by 11:59 PM</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {user?.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-3">
            {/* Mobile Search */}
            {isAuthenticated && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Mobile Navigation */}
            {isAuthenticated && (
              <nav className="flex flex-col space-y-2">
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link to="/courses" onClick={() => setMobileMenuOpen(false)}>
                    Courses
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link to="/calendar" onClick={() => setMobileMenuOpen(false)}>
                    Calendar
                  </Link>
                </Button>
                {user?.role === 'instructor' && (
                  <Button variant="ghost" size="sm" className="justify-start" asChild>
                    <Link to="/instructor" onClick={() => setMobileMenuOpen(false)}>
                      Teach
                    </Link>
                  </Button>
                )}
                {user?.role === 'admin' && (
                  <Button variant="ghost" size="sm" className="justify-start" asChild>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      Admin
                    </Link>
                  </Button>
                )}
              </nav>
            )}
          </div>
        </div>
      )}
    </header>
  );
}