
import { useState, ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  CheckCircle,
  Shield,
  Menu,
  X,
  ChevronDown,
  Home,
  Database,
  Bell,
  FileText,
  Lock,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Header } from './Header';

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: { title: string; href: string }[];
}

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'User Management',
      icon: Users,
      children: [
        { title: 'All Users', href: '/admin/users' },
        { title: 'Add User', href: '/admin/add-user' },
        { title: 'Roles & Permissions', href: '/admin/roles' },
        { title: 'User Activity', href: '/admin/user-activity' },
      ],
    },
    {
      title: 'Course Management',
      icon: BookOpen,
      children: [
        { title: 'All Courses', href: '/admin/courses' },
        { title: 'Create Course', href: '/admin/create-course' },
      ],
    },
    {
      title: 'Data Management',
      icon: Database,
      children: [
        { title: 'Bulk Import', href: '/admin/bulk-import' },
        { title: 'Export Data', href: '/admin/export-data' },
      ],
    },
    {
      title: 'Approvals',
      href: '/admin/approvals',
      icon: CheckCircle,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      title: 'Security',
      icon: Shield,
      children: [
        { title: 'Security Logs', href: '/admin/security-logs' },
        { title: 'Access Control', href: '/admin/access-control' },
        { title: 'Audit Trail', href: '/admin/audit-trail' },
      ],
    },
    {
      title: 'Reports',
      icon: FileText,
      children: [
        { title: 'System Reports', href: '/admin/reports' },
        { title: 'User Reports', href: '/admin/user-reports' },
        { title: 'Course Reports', href: '/admin/course-reports' },
      ],
    },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children?: { href: string }[]) => {
    return children?.some((child) => location.pathname === child.href);
  };

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isOpen = openMenus[item.title] ?? isParentActive(item.children);

    if (item.children) {
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent',
                isParentActive(item.children) && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {sidebarOpen && <span>{item.title}</span>}
              </div>
              {sidebarOpen && <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />}
            </button>
          </CollapsibleTrigger>
          {sidebarOpen && (
            <CollapsibleContent className="ml-6 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent',
                    isActive(child.href) && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  {child.title}
                </Link>
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <Link
        to={item.href!}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent',
          isActive(item.href!) && 'bg-accent text-accent-foreground font-medium'
        )}
      >
        <item.icon className="h-4 w-4" />
        {sidebarOpen && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        isAuthenticated
        user={{
          name: 'Admin User',
          email: 'admin@must.ac.tz',
          role: 'admin',
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col border-r bg-card transition-all duration-300 h-full overflow-hidden',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm">Admin Portal</h2>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent text-muted-foreground"
            >
              <Home className="h-4 w-4" />
              {sidebarOpen && <span>Back to Home</span>}
            </Link>
          </div>
        </aside>

        {/* Mobile Menu Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-72 bg-card border-r z-50 overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Admin Portal</h2>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.title} onClick={() => setMobileMenuOpen(false)}>
                    <NavItemComponent item={item} />
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </aside>
          </>
        )}

        {/* Main Content - Uses Outlet for nested routes or children */}
        <main className="flex-1 overflow-y-auto bg-background h-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}