import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Plus,
  FolderOpen,
  FileText,
  ClipboardList,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  FileQuestion,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Header } from './Header';
import { Footer } from './Footer';

interface InstructorLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: { title: string; href: string }[];
}

export function InstructorLayout({ children }: InstructorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/instructor',
      icon: LayoutDashboard,
    },
    {
      title: 'Course Management',
      icon: FolderOpen,
      children: [
        { title: 'My Courses', href: '/instructor/courses' },
        { title: 'Create Course', href: '/instructor/create-course' },
        { title: 'Manage Modules', href: '/instructor/modules' },
        { title: 'Course Analytics', href: '/instructor/analytics' },
      ],
    },
    {
      title: 'Assessments',
      icon: FileQuestion,
      children: [
        { title: 'Assignments', href: '/instructor/assignments' },
        { title: 'Create Assignment', href: '/instructor/create-assignment' },
        { title: 'Tests & Exams', href: '/instructor/exams' },
        { title: 'Grade Submissions', href: '/instructor/grade' },
        { title: 'Marking Dashboard', href: '/instructor/marking' },
        { title: 'Results Overview', href: '/instructor/results-overview' },
      ],
    },
    {
      title: 'Students',
      icon: Users,
      children: [
        { title: 'Student List', href: '/instructor/students' },
        { title: 'Student Reviews', href: '/instructor/student-review' },
        { title: 'Message Students', href: '/instructor/messages' },
      ],
    },
    {
      title: 'Discussions',
      href: '/instructor/discussions',
      icon: MessageSquare,
    },
    {
      title: 'Live Sessions',
      href: '/instructor/live-sessions',
      icon: Video,
    },
    {
      title: 'Schedule',
      href: '/instructor/schedule',
      icon: Calendar,
    },
    {
      title: 'Analytics',
      href: '/instructor/analytics',
      icon: BarChart3,
    },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children?: { href: string }[]) => {
    return children?.some((child) => location.pathname === child.href);
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const [open, setOpen] = useState(isParentActive(item.children));

    if (item.children) {
      return (
        <Collapsible open={open} onOpenChange={setOpen}>
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
              {sidebarOpen && <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />}
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
    <div className="min-h-screen flex flex-col">
      <Header
        isAuthenticated
        user={{
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@must.ac.tz',
          role: 'instructor',
        }}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && <h2 className="font-semibold text-sm">Instructor Portal</h2>}
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
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent text-muted-foreground"
            >
              <Home className="h-4 w-4" />
              {sidebarOpen && <span>Student View</span>}
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
                <h2 className="font-semibold">Instructor Portal</h2>
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
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Student View</span>
                </Link>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
