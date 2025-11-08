import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  UserPlus,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      trend: "up",
      description: "Students, Instructors & Staff",
      icon: Users
    },
    {
      title: "Active Courses",
      value: "156",
      change: "+8%",
      trend: "up", 
      description: "Published this semester",
      icon: BookOpen
    },
    {
      title: "Certificates Issued",
      value: "1,234",
      change: "+23%",
      trend: "up",
      description: "This academic year",
      icon: GraduationCap
    },
    {
      title: "System Health",
      value: "98.9%",
      change: "+0.2%",
      trend: "up",
      description: "Uptime this month",
      icon: TrendingUp
    }
  ];

  const recentUsers = [
    {
      id: 1,
      name: "John Mwalimu",
      email: "john.mwalimu@student.must.ac.tz",
      role: "student",
      status: "active",
      joinDate: "Dec 1, 2024",
      department: "Computer Science"
    },
    {
      id: 2,
      name: "Dr. Michael Thompson",
      email: "m.thompson@must.ac.tz", 
      role: "instructor",
      status: "pending",
      joinDate: "Nov 28, 2024",
      department: "Mathematics"
    },
    {
      id: 3,
      name: "Grace Kikoti",
      email: "grace.kikoti@student.must.ac.tz",
      role: "student", 
      status: "active",
      joinDate: "Nov 25, 2024",
      department: "Engineering"
    },
    {
      id: 4,
      name: "Prof. Lisa Anderson",
      email: "l.anderson@must.ac.tz",
      role: "instructor",
      status: "active", 
      joinDate: "Nov 20, 2024",
      department: "Computer Science"
    }
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "course",
      title: "Introduction to Artificial Intelligence",
      instructor: "Dr. Michael Thompson",
      department: "Computer Science",
      submittedDate: "Dec 5, 2024",
      status: "pending"
    },
    {
      id: 2,
      type: "user",
      title: "Instructor Registration",
      name: "Prof. James Wilson",
      department: "Mathematics", 
      submittedDate: "Dec 3, 2024",
      status: "pending"
    },
    {
      id: 3,
      type: "course",
      title: "Advanced Data Analytics",
      instructor: "Dr. Sarah Johnson",
      department: "Statistics",
      submittedDate: "Dec 1, 2024",
      status: "under_review"
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      title: "Server Load High",
      message: "Database server experiencing high load during peak hours",
      time: "2 hours ago",
      severity: "medium"
    },
    {
      id: 2,
      type: "info",
      title: "Maintenance Scheduled", 
      message: "System maintenance scheduled for Dec 15, 2024 at 2:00 AM",
      time: "1 day ago",
      severity: "low"
    },
    {
      id: 3,
      type: "success",
      title: "Backup Completed",
      message: "Daily backup completed successfully",
      time: "2 days ago", 
      severity: "low"
    }
  ];

  const quickActions = [
    { icon: UserPlus, label: "Add User", action: "add-user" },
    { icon: Plus, label: "Create Course", action: "create-course" },
    { icon: Upload, label: "Bulk Import", action: "bulk-import" },
    { icon: Download, label: "Export Data", action: "export-data" },
    { icon: Settings, label: "System Settings", action: "settings" },
    { icon: BarChart3, label: "Reports", action: "reports" }
  ];

  return (
    <AdminLayout>
      <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management tools for MUST LMS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-academic transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex-col gap-2"
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent User Registrations</CardTitle>
                  <CardDescription>
                    Latest users who joined the platform
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'instructor' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Badge className={user.status === 'active' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground">{user.department}</p>
                      <p className="text-sm text-muted-foreground">Joined {user.joinDate}</p>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Items requiring administrative approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === 'course' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                        <h4 className="font-medium">{item.title}</h4>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.type === 'course' ? (
                          <>
                            <p>Instructor: {item.instructor}</p>
                            <p>Department: {item.department}</p>
                          </>
                        ) : (
                          <>
                            <p>Name: {item.name}</p>
                            <p>Department: {item.department}</p>
                          </>
                        )}
                        <p>Submitted: {item.submittedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={item.status === 'pending' ? 'bg-warning text-warning-foreground' : ''} variant="secondary">
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Students</span>
                    <span className="text-sm font-medium">2,156</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Instructors</span>
                    <span className="text-sm font-medium">234</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Staff</span>
                    <span className="text-sm font-medium">457</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Published Courses</span>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Draft Courses</span>
                    <span className="text-sm font-medium">23</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Archived Courses</span>
                    <span className="text-sm font-medium">89</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts & Notifications</CardTitle>
              <CardDescription>
                Recent system events and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <div className="flex-shrink-0 mt-1">
                      {alert.type === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      {alert.type === 'info' && (
                        <Clock className="h-4 w-4 text-primary" />
                      )}
                      {alert.type === 'success' && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <Badge 
                      variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                      className={alert.severity === 'medium' ? 'bg-warning text-warning-foreground' : ''}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}