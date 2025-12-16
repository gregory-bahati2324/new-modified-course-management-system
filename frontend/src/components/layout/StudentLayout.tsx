import { useState, ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  Calendar,
  FileText,
  Trophy,
  MessageSquare,
  User,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  ClipboardCheck,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Header } from './Header';

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: NavItem[];
}

interface StudentLayoutProps {
  children?: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Enrollment',
      href: '/student/enrollment',
      icon: GraduationCap,
    },
    {
      title: 'My Courses',
      icon: BookOpen,
      children: [
        { title: 'All Courses', href: '/student/courses', icon: BookOpen },
        { title: 'Browse Courses', href: '/courses', icon: GraduationCap },
        { title: 'Course Progress', href: '/student/progress', icon: ClipboardCheck },
      ],
    },
    {
      title: 'Assignments',
      icon: FileText,
      children: [
        { title: 'All Assignments', href: '/student/assignments', icon: FileText },
        { title: 'Submit Assignment', href: '/student/submit-assignment', icon: FileText },
        { title: 'Grades', href: '/student/grades', icon: Trophy },
      ],
    },
    {
      title: 'Schedule',
      href: '/student/schedule',
      icon: Calendar,
    },
    {
      title: 'Forums',
      href: '/forums',
      icon: MessageSquare,
    },
    {
      title: 'Certificates',
      href: '/certificates',
      icon: Trophy,
    },
    {
      title: 'Profile',
      href: '/student/profile',
      icon: User,
    },
    {
      title: 'Discussions',
      href: '/student/discussions',
      icon: MessageSquare,
    },
    {
      title: 'Live Sessions',
      href: '/student/live-sessions',
      icon: Video,
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: NavItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => child.href && isActive(child.href));
    }
    return false;
  };

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;
    const isOpen = openMenus[item.title] ?? isParentActive(item);

    if (hasChildren) {
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-between w-full px-4 py-2 text-sm rounded-lg transition-colors",
                "hover:bg-accent",
                isParentActive(item) && "bg-accent text-primary font-medium"
              )}
              style={{ paddingLeft: `${(depth + 1) * 16}px` }}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span>{item.title}</span>}
              </div>
              {sidebarOpen && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "transform rotate-180"
                  )}
                />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {item.children?.map((child, index) => (
              <NavItemComponent key={index} item={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        to={item.href || '#'}
        className={cn(
          "flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors",
          "hover:bg-accent",
          isActive(item.href || '') && "bg-primary text-primary-foreground font-medium"
        )}
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
      >
        <Icon className="h-4 w-4" />
        {sidebarOpen && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <div className="h-screen flex flex-col w-full overflow-hidden">
      <Header />
      
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r bg-card transition-all duration-300 h-full overflow-hidden",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && <h2 className="font-semibold">Student Portal</h2>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavItemComponent key={index} item={item} />
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden fixed bottom-4 left-4 z-50 rounded-full shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-card border-r z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Student Portal</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item, index) => (
                  <NavItemComponent key={index} item={item} />
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content - Uses Outlet for nested routes or children */}
        <main className="flex-1 overflow-y-auto h-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}