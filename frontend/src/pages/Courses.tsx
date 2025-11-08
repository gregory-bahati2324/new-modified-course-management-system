import { useState } from 'react';
import { Search, Filter, Grid, List, Star, Clock, Users, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { value: 'all', label: 'All Categories', count: 45 },
    { value: 'computer-science', label: 'Computer Science', count: 12 },
    { value: 'engineering', label: 'Engineering', count: 8 },
    { value: 'business', label: 'Business', count: 6 },
    { value: 'mathematics', label: 'Mathematics', count: 7 },
    { value: 'science', label: 'Science', count: 12 }
  ];

  const courses = [
    {
      id: 1,
      title: "Advanced Database Systems",
      instructor: "Dr. Sarah Johnson",
      description: "Master database design, optimization, and advanced querying techniques for enterprise applications.",
      category: "Computer Science",
      level: "Advanced",
      duration: "12 weeks",
      students: 1240,
      rating: 4.9,
      totalRatings: 234,
      price: "Free",
      thumbnail: null,
      tags: ["SQL", "NoSQL", "Database Design", "Performance"],
      isEnrolled: true,
      progress: 75
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Chen",
      description: "Introduction to machine learning algorithms, data preprocessing, and model evaluation.",
      category: "Computer Science",
      level: "Intermediate",
      duration: "10 weeks",
      students: 2100,
      rating: 4.8,
      totalRatings: 456,
      price: "Free",
      thumbnail: null,
      tags: ["Python", "Scikit-learn", "Data Science", "AI"],
      isEnrolled: true,
      progress: 60
    },
    {
      id: 3,
      title: "Sustainable Engineering Design",
      instructor: "Dr. Emily Davis",
      description: "Learn sustainable engineering principles and design methodologies for environmental impact.",
      category: "Engineering",
      level: "Intermediate",
      duration: "8 weeks",
      students: 856,
      rating: 4.7,
      totalRatings: 123,
      price: "Free",
      thumbnail: null,
      tags: ["Sustainability", "Design", "Environment", "Innovation"],
      isEnrolled: false,
      progress: 0
    },
    {
      id: 4,
      title: "Digital Marketing Strategy",
      instructor: "Prof. James Wilson",
      description: "Comprehensive course on digital marketing strategies, analytics, and campaign optimization.",
      category: "Business",
      level: "Beginner",
      duration: "6 weeks",
      students: 1876,
      rating: 4.6,
      totalRatings: 287,
      price: "Free",
      thumbnail: null,
      tags: ["Marketing", "Digital", "Analytics", "Strategy"],
      isEnrolled: false,
      progress: 0
    },
    {
      id: 5,
      title: "Advanced Calculus and Analysis",
      instructor: "Dr. Maria Rodriguez",
      description: "Deep dive into advanced calculus topics including real analysis and complex functions.",
      category: "Mathematics",
      level: "Advanced",
      duration: "14 weeks",
      students: 542,
      rating: 4.9,
      totalRatings: 89,
      price: "Free",
      thumbnail: null,
      tags: ["Calculus", "Analysis", "Mathematics", "Theory"],
      isEnrolled: false,
      progress: 0
    },
    {
      id: 6,
      title: "Organic Chemistry Laboratory",
      instructor: "Prof. David Kim",
      description: "Hands-on laboratory experience with organic chemistry synthesis and analysis techniques.",
      category: "Science",
      level: "Intermediate",
      duration: "12 weeks",
      students: 634,
      rating: 4.8,
      totalRatings: 156,
      price: "Free",
      thumbnail: null,
      tags: ["Chemistry", "Laboratory", "Synthesis", "Analysis"],
      isEnrolled: false,
      progress: 0
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           course.category.toLowerCase().replace(' ', '-') === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase() === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const CourseCard = ({ course, isGridView }: { course: typeof courses[0], isGridView: boolean }) => (
    <Card className={`group hover:shadow-academic transition-all duration-300 hover:-translate-y-1 ${
      isGridView ? '' : 'flex flex-row'
    }`}>
      {/* Course Thumbnail */}
      <div className={`${
        isGridView ? 'aspect-video' : 'w-48 flex-shrink-0'
      } bg-gradient-to-br from-primary-subtle to-accent rounded-t-lg ${isGridView ? '' : 'rounded-l-lg rounded-t-none'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-hero-gradient opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-white" />
        </div>
        {course.isEnrolled && (
          <Badge className="absolute top-2 right-2 bg-success text-white">
            Enrolled
          </Badge>
        )}
      </div>

      <div className={`${isGridView ? '' : 'flex-1'}`}>
        <CardHeader className={isGridView ? '' : 'pb-2'}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {course.level}
                </Badge>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                {course.title}
              </CardTitle>
              <CardDescription className="mt-1">
                by {course.instructor}
              </CardDescription>
            </div>
            <div className="flex items-center text-yellow-500 ml-2">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-medium">{course.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">({course.totalRatings})</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className={`text-sm text-muted-foreground ${isGridView ? 'line-clamp-2' : 'line-clamp-1'}`}>
            {course.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, isGridView ? 4 : 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > (isGridView ? 4 : 3) && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - (isGridView ? 4 : 3)}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course.students.toLocaleString()}
              </div>
            </div>
            <div className="font-semibold text-primary">
              {course.price}
            </div>
          </div>

          {course.isEnrolled && course.progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {course.isEnrolled ? (
              <Button className="flex-1">
                Continue Learning
              </Button>
            ) : (
              <>
                <Button className="flex-1">
                  Enroll Now
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-xl text-muted-foreground">
          Discover and enroll in courses that match your learning goals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses, instructors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Sort by
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('popular')}>
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>
                Highest Rated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('duration')}>
                Shortest Duration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses ({courses.filter(c => c.isEnrolled).length})</TabsTrigger>
          <TabsTrigger value="completed">Completed (0)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} isGridView={viewMode === 'grid'} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="enrolled" className="mt-6">
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCourses.filter(course => course.isEnrolled).map((course) => (
              <CourseCard key={course.id} course={course} isGridView={viewMode === 'grid'} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No completed courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your enrolled courses to see them here and earn certificates.
              </p>
              <Button>Continue Learning</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredCourses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find more courses.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}