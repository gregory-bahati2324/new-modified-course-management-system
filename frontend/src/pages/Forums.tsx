import { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Pin,
  Lock,
  Eye,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Forums() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 1,
      name: "General Discussion",
      description: "General topics and announcements",
      topics: 45,
      posts: 234,
      lastPost: {
        title: "Welcome to MUST LMS Forums",
        author: "Admin",
        time: "2 hours ago"
      }
    },
    {
      id: 2,
      name: "Course Discussions",
      description: "Course-specific discussions and help",
      topics: 128,
      posts: 892,
      lastPost: {
        title: "Database Assignment Help",
        author: "John Mwalimu",
        time: "30 minutes ago"
      }
    },
    {
      id: 3,
      name: "Technical Support",
      description: "Platform issues and technical help",
      topics: 23,
      posts: 67,
      lastPost: {
        title: "Login Issues",
        author: "Grace Kikoti",
        time: "1 hour ago"
      }
    },
    {
      id: 4,
      name: "Student Life",
      description: "Campus life, events, and social discussions",
      topics: 76,
      posts: 445,
      lastPost: {
        title: "Study Group Formation",
        author: "Peter Msigwa",
        time: "4 hours ago"
      }
    }
  ];

  const recentTopics = [
    {
      id: 1,
      title: "How to optimize database queries for large datasets?",
      category: "Advanced Database Systems",
      author: "Sarah Johnson",
      authorRole: "instructor",
      replies: 12,
      views: 89,
      likes: 8,
      lastReply: "15 minutes ago",
      isPinned: false,
      isLocked: false,
      tags: ["database", "optimization", "performance"]
    },
    {
      id: 2,
      title: "Assignment 2 Clarifications - Please Read",
      category: "Machine Learning Fundamentals",
      author: "Michael Chen",
      authorRole: "instructor",
      replies: 8,
      views: 145,
      likes: 15,
      lastReply: "1 hour ago",
      isPinned: true,
      isLocked: false,
      tags: ["assignment", "clarification"]
    },
    {
      id: 3,
      title: "Study group for final exams - CS students",
      category: "Student Life",
      author: "John Mwalimu",
      authorRole: "student",
      replies: 23,
      views: 167,
      likes: 18,
      lastReply: "2 hours ago",
      isPinned: false,
      isLocked: false,
      tags: ["study-group", "exams", "computer-science"]
    },
    {
      id: 4,
      title: "Error in lecture slide 45 - Data Structures",
      category: "Data Structures & Algorithms",
      author: "Grace Kikoti",
      authorRole: "student",
      replies: 5,
      views: 34,
      likes: 3,
      lastReply: "3 hours ago",
      isPinned: false,
      isLocked: false,
      tags: ["error", "lecture", "clarification"]
    },
    {
      id: 5,
      title: "Campus WiFi connectivity issues",
      category: "Technical Support",
      author: "Peter Msigwa",
      authorRole: "student",
      replies: 7,
      views: 78,
      likes: 12,
      lastReply: "5 hours ago",
      isPinned: false,
      isLocked: true,
      tags: ["wifi", "connectivity", "campus"]
    }
  ];

  const filteredTopics = recentTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Forums</h1>
          <p className="text-muted-foreground">
            Connect with fellow students and instructors, ask questions, and share knowledge
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics, categories, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="topics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="topics">Recent Topics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-academic transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {topic.isPinned && (
                              <Pin className="h-4 w-4 text-primary" />
                            )}
                            {topic.isLocked && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                              {topic.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>by</span>
                            <span className="font-medium">{topic.author}</span>
                            {topic.authorRole === 'instructor' && (
                              <Badge variant="secondary" className="text-xs">Instructor</Badge>
                            )}
                            <span>in</span>
                            <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Reply className="h-4 w-4" />
                              <span>{topic.replies} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{topic.views} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{topic.likes} likes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Last reply {topic.lastReply}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {topic.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Follow Topic</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-academic transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{category.topics} topics</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Reply className="h-4 w-4" />
                        <span>{category.posts} posts</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="font-medium">{category.lastPost.title}</div>
                      <div className="text-xs">
                        by {category.lastPost.author} • {category.lastPost.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}