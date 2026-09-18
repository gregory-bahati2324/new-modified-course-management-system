import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, Globe, LogOut } from 'lucide-react';
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
import { authService, SESSION_ENDED_EVENT, UserRole } from '@/services/authService';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderUser {
  name: string;
  registrationNumber: string;
  role: UserRole;
}

interface HeaderProps {
  // Both are now optional — if the parent layout doesn't pass them,
  // Header figures out auth state for itself so the Logout button
  // always shows up (and works) whenever someone is actually logged in.
  isAuthenticated?: boolean;
  user?: HeaderUser;
}

function readAuthFromStorage(): { isAuthenticated: boolean; user?: HeaderUser } {
  const authenticated = authService.isAuthenticated();
  if (!authenticated) return { isAuthenticated: false };

  const cached = authService.getCachedUser();
  if (!cached) return { isAuthenticated: true };

  return {
    isAuthenticated: true,
    user: {
      name: `${cached.first_name} ${cached.last_name}`,
      registrationNumber: cached.registrationNumber,
      role: cached.role,
    },
  };
}

export function Header({ isAuthenticated, user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selfDetected, setSelfDetected] = useState(readAuthFromStorage);

  // Keep the self-detected auth state fresh (covers login/logout that
  // happen without this component remounting).
  useEffect(() => {
    if (isAuthenticated !== undefined) return; // parent is controlling this explicitly
    setSelfDetected(readAuthFromStorage());
    const onStorage = () => setSelfDetected(readAuthFromStorage());
    window.addEventListener('storage', onStorage);
    window.addEventListener(SESSION_ENDED_EVENT, onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SESSION_ENDED_EVENT, onStorage);
    };
  }, [isAuthenticated]);

  // The "user details" shown in the dropdown label should be real,
  // current backend data — not just whatever was cached at login
  // time. Cache paints instantly (above), then this quietly refreshes
  // it from GET /auth/me once per mount.
  useEffect(() => {
    if (isAuthenticated !== undefined) return; // parent is controlling this explicitly
    if (!authService.isAuthenticated()) return;

    let cancelled = false;
    authService.fetchUserDetails()
      .then((fresh) => {
        if (cancelled) return;
        setSelfDetected({
          isAuthenticated: true,
          user: {
            name: `${fresh.first_name} ${fresh.last_name}`,
            registrationNumber: fresh.registrationNumber,
            role: fresh.role,
          },
        });
      })
      .catch(() => {
        // Cache-derived state (already painted) stays as the fallback.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const effectiveIsAuthenticated = isAuthenticated ?? selfDetected.isAuthenticated;
  const effectiveUser = user ?? selfDetected.user;

  const handleSignOut = () => {
    authService.logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-hero-gradient">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Greg-LMS</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Learning Hub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {effectiveIsAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/courses">Courses</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar">Calendar</Link>
              </Button>
              {effectiveUser?.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
            </nav>
          )}
        </div>

        {/* Search Bar - Desktop */}
        {effectiveIsAuthenticated && (
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

          {effectiveIsAuthenticated ? (
            <>
              {/* Notifications — real data from the notification
                  microservice, not the previous hard-coded "3" badge
                  and two static items. */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white text-black shadow-lg rounded-md z-50">
                  {/* User details — sourced from the backend (GET /auth/me),
                      never mock data. */}
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{effectiveUser?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Reg No: {effectiveUser?.registrationNumber}
                      </p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {effectiveUser?.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Logout — a dedicated, always-visible button rather than
                  a buried menu item. One click, no menu to open first. */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : null}

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
            {effectiveIsAuthenticated && (
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
            {effectiveIsAuthenticated && (
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
                {effectiveUser?.role === 'instructor' && (
                  <Button variant="ghost" size="sm" className="justify-start" asChild>
                    <Link to="/instructor" onClick={() => setMobileMenuOpen(false)}>
                      Teach
                    </Link>
                  </Button>
                )}
                {effectiveUser?.role === 'admin' && (
                  <Button variant="ghost" size="sm" className="justify-start" asChild>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      Admin
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 text-destructive"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </nav>
            )}
          </div>
        </div>
      )}
    </header>
  );
}