import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService, PlatformAnalytics } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      if (timeRange === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (timeRange === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const data = await adminService.getPlatformAnalytics({
        start_date: startDate.toISOString(),
        end_date: endDate,
      });
      setAnalytics(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const blob = await adminService.exportData('analytics', 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  if (loading || !analytics) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance and usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.user_growth.students[analytics.user_growth.students.length - 1] +
                    analytics.user_growth.instructors[
                      analytics.user_growth.instructors.length - 1
                    ]}
                </div>
                <p className="text-xs text-muted-foreground">
                  Students & Instructors combined
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.course_stats.total_published}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.course_stats.new_this_month} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.engagement_metrics.completion_rate}%
                </div>
                <Progress
                  value={analytics.engagement_metrics.completion_rate}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.engagement_metrics.avg_session_duration}m
                </div>
                <p className="text-xs text-muted-foreground">Per user session</p>
              </CardContent>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>Student and instructor registration over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Students</span>
                    <span className="text-muted-foreground">
                      {analytics.user_growth.students[analytics.user_growth.students.length - 1]}
                    </span>
                  </div>
                  <div className="h-8 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          (analytics.user_growth.students[
                            analytics.user_growth.students.length - 1
                          ] /
                            (analytics.user_growth.students[
                              analytics.user_growth.students.length - 1
                            ] +
                              analytics.user_growth.instructors[
                                analytics.user_growth.instructors.length - 1
                              ])) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Instructors</span>
                    <span className="text-muted-foreground">
                      {
                        analytics.user_growth.instructors[
                          analytics.user_growth.instructors.length - 1
                        ]
                      }
                    </span>
                  </div>
                  <div className="h-8 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all"
                      style={{
                        width: `${
                          (analytics.user_growth.instructors[
                            analytics.user_growth.instructors.length - 1
                          ] /
                            (analytics.user_growth.students[
                              analytics.user_growth.students.length - 1
                            ] +
                              analytics.user_growth.instructors[
                                analytics.user_growth.instructors.length - 1
                              ])) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
                <CardDescription>Overview of course status distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Published Courses</span>
                    <span className="text-2xl font-bold">
                      {analytics.course_stats.total_published}
                    </span>
                  </div>
                  <Progress
                    value={
                      (analytics.course_stats.total_published /
                        (analytics.course_stats.total_published +
                          analytics.course_stats.total_draft +
                          analytics.course_stats.total_archived)) *
                      100
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Draft Courses</span>
                    <span className="text-2xl font-bold">
                      {analytics.course_stats.total_draft}
                    </span>
                  </div>
                  <Progress
                    value={
                      (analytics.course_stats.total_draft /
                        (analytics.course_stats.total_published +
                          analytics.course_stats.total_draft +
                          analytics.course_stats.total_archived)) *
                      100
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Archived Courses</span>
                    <span className="text-2xl font-bold">
                      {analytics.course_stats.total_archived}
                    </span>
                  </div>
                  <Progress
                    value={
                      (analytics.course_stats.total_archived /
                        (analytics.course_stats.total_published +
                          analytics.course_stats.total_draft +
                          analytics.course_stats.total_archived)) *
                      100
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Platform activity and interaction stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Assignments Submitted</p>
                    <p className="text-xs text-muted-foreground">Total submissions</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.engagement_metrics.total_assignments_submitted.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Forum Posts</p>
                    <p className="text-xs text-muted-foreground">Discussion activity</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.engagement_metrics.total_forum_posts.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Avg. Session Duration</p>
                    <p className="text-xs text-muted-foreground">Per user</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.engagement_metrics.avg_session_duration} min
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}
