import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  Users,
  BookOpen,
  ChevronDown,
  CheckCircle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from '@/hooks/use-toast';
import { courseService, type Course } from '@/services/courseService';
import { authService } from '@/services/authService';

type SortOption = 'popular' | 'rating' | 'newest' | 'duration';
type ViewMode = 'grid' | 'list';

// Pulls a leading number of weeks/hours out of a free-text duration string
// like "12 weeks" so "shortest duration" sorting has something real to sort on.
function parseDurationValue(duration?: string): number {
  if (!duration) return Number.POSITIVE_INFINITY;
  const match = duration.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : Number.POSITIVE_INFINITY;
}

export default function Courses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuthed = authService.isAuthenticated();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [activeTab, setActiveTab] = useState('all');

  // Load the real course catalog from the backend.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    courseService
      .getPublicCourses(500)
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) setError('Courses could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // If the user is logged in, pull their real enrollment records so we can
  // show accurate "Enrolled" / "Completed" state instead of guessing.
  useEffect(() => {
    if (!isAuthed) return;
    let cancelled = false;

    courseService
      .getStudentEnrollments()
      .then((enrollments) => {
        if (cancelled) return;
        setEnrolledIds(enrollments.map((e) => e.course_id));
        setCompletedIds(enrollments.filter((e) => e.completed).map((e) => e.course_id));
      })
      .catch(() => {
        // Not fatal — the catalog still works, just without enrollment badges.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  // Category/level options are derived from the actual courses returned by
  // the backend (category/level are free-text fields there), so the filters
  // never list an option that doesn't correspond to real data.
  const categoryOptions = useMemo(() => {
    const values = new Set(courses.map((c) => c.category).filter(Boolean));
    return Array.from(values).sort();
  }, [courses]);

  const levelOptions = useMemo(() => {
    const values = new Set(courses.map((c) => c.level).filter(Boolean));
    return Array.from(values).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title?.toLowerCase().includes(query) ||
        course.instructor_name?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.code?.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'duration':
          return parseDurationValue(a.duration) - parseDurationValue(b.duration);
        case 'popular':
        default:
          return (b.students_enrolled ?? 0) - (a.students_enrolled ?? 0);
      }
    });

    return sorted;
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  const myCourses = useMemo(
    () => filteredCourses.filter((c) => enrolledIds.includes(c.id)),
    [filteredCourses, enrolledIds]
  );

  const completedCourses = useMemo(
    () => filteredCourses.filter((c) => completedIds.includes(c.id)),
    [filteredCourses, completedIds]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSearchParams({});
  };

  const handleEnroll = (courseId: string) => {
    if (!isAuthed) {
      // Not logged in — send them to sign in (or create an account), and
      // remember to bring them back to finish enrolling afterwards.
      navigate('/login', { state: { from: '/student/enrollment' } });
      return;
    }

    // Logged in — hand off to the real enrollment flow in the student
    // dashboard rather than duplicating that logic here.
    toast({
      title: 'Continue in your dashboard',
      description: 'Finish enrolling from the Course Enrollment page.',
    });
    navigate('/student/enrollment');
  };

  const sortLabel: Record<SortOption, string> = {
    popular: 'Most Popular',
    rating: 'Highest Rated',
    newest: 'Newest First',
    duration: 'Shortest Duration',
  };

  const CourseCard = ({ course, isGridView }: { course: Course; isGridView: boolean }) => {
    const isCompleted = completedIds.includes(course.id);
    const isEnrolled = enrolledIds.includes(course.id);

    return (
      <Card
        className={`group hover:shadow-academic transition-all duration-300 hover:-translate-y-1 ${
          isGridView ? '' : 'flex flex-row'
        }`}
      >
        {/* Course Thumbnail */}
        <div
          className={`${
            isGridView ? 'aspect-video' : 'w-48 flex-shrink-0'
          } bg-gradient-to-br from-primary-subtle to-accent rounded-t-lg ${
            isGridView ? '' : 'rounded-l-lg rounded-t-none'
          } relative overflow-hidden`}
        >
          {course.image_url ? (
            <img src={course.image_url} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-hero-gradient opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </>
          )}
          {isCompleted ? (
            <Badge className="absolute top-2 right-2 bg-success text-white">Completed</Badge>
          ) : isEnrolled ? (
            <Badge className="absolute top-2 right-2 bg-success text-white">Enrolled</Badge>
          ) : null}
        </div>

        <div className={`${isGridView ? '' : 'flex-1'}`}>
          <CardHeader className={isGridView ? '' : 'pb-2'}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {course.category && (
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                  )}
                  {course.level && (
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  by {course.instructor_name || 'Instructor'}
                </CardDescription>
              </div>
              {typeof course.rating === 'number' && course.rating > 0 && (
                <div className="flex items-center text-yellow-500 ml-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-medium">{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {course.description && (
              <p className={`text-sm text-muted-foreground ${isGridView ? 'line-clamp-2' : 'line-clamp-1'}`}>
                {course.description}
              </p>
            )}

            {course.tags && course.tags.length > 0 && (
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
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration || 'Flexible'}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {(course.students_enrolled ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isCompleted ? (
                <Button className="flex-1" variant="secondary" asChild>
                  <Link to="/certificates">
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Link>
                </Button>
              ) : isEnrolled ? (
                <Button className="flex-1" asChild>
                  <Link to={`/student/course/${course.id}/learn`}>Continue Learning</Link>
                </Button>
              ) : (
                <>
                  <Button className="flex-1" onClick={() => handleEnroll(course.id)}>
                    Enroll Now
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/course/${course.id}`}>Preview</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  const gridClass = `grid gap-6 ${
    viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
  }`;

  const renderCourseGrid = (list: Course[]) => (
    <div className={gridClass}>
      {list.map((course) => (
        <CourseCard key={course.id} course={course} isGridView={viewMode === 'grid'} />
      ))}
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className={gridClass}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (title: string, description: string, action?: React.ReactNode) => (
    <Card className="text-center py-12">
      <CardContent>
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {action}
      </CardContent>
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

        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories ({courses.length})</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category} ({courses.filter((c) => c.category === category).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levelOptions.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {sortLabel[sortBy]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('popular')}>Most Popular</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>Highest Rated</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('duration')}>Shortest Duration</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading / error states */}
      {loading && renderLoadingSkeleton()}

      {!loading && error && renderEmptyState('Courses could not be loaded', error)}

      {!loading && !error && (
        <>
          {isAuthed ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
                <TabsTrigger value="enrolled">My Courses ({myCourses.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {filteredCourses.length === 0
                  ? renderEmptyState(
                      'No courses found',
                      'Try adjusting your search terms or filters to find more courses.',
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    )
                  : renderCourseGrid(filteredCourses)}
              </TabsContent>

              <TabsContent value="enrolled" className="mt-6">
                {myCourses.length === 0
                  ? renderEmptyState(
                      "You haven't enrolled in any courses yet",
                      'Browse the catalog and enroll in a course to see it here.',
                      <Button onClick={() => setActiveTab('all')}>Browse Courses</Button>
                    )
                  : renderCourseGrid(myCourses)}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedCourses.length === 0
                  ? renderEmptyState(
                      'No completed courses yet',
                      'Complete your enrolled courses to see them here and earn certificates.',
                      <Button onClick={() => setActiveTab('enrolled')}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Go to My Courses
                      </Button>
                    )
                  : renderCourseGrid(completedCourses)}
              </TabsContent>
            </Tabs>
          ) : filteredCourses.length === 0 ? (
            renderEmptyState(
              'No courses found',
              'Try adjusting your search terms or filters to find more courses.',
              <Button onClick={clearFilters}>Clear Filters</Button>
            )
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} available
              </p>
              {renderCourseGrid(filteredCourses)}
            </>
          )}
        </>
      )}
    </div>
  );
}
