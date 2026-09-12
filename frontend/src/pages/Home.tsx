import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { courseService, type Course } from '@/services/courseService';

export default function Home() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    courseService.getPublicCourses(8)
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) setCourseError('Courses could not be loaded. Please try again later.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = search.trim()
      ? `/courses?q=${encodeURIComponent(search.trim())}`
      : '/courses';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Moodle-style public navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">Greg-LMS</div>
              <div className="text-xs text-muted-foreground">Learning Management System</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" asChild>
              <Link to="/courses">Courses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth/login">Sign in</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/auth/register">Sign up</Link>
            </Button>
          </nav>

          <div className="flex gap-2 sm:hidden">
            <Button size="sm" variant="outline" asChild>
              <Link to="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Welcome section */}
        <section className="border-b bg-muted/30">
          <div className="container py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-5">Greg-LMS Learning Platform</Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Welcome to Greg-LMS
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Access your courses, learning materials, assignments, assessments and progress
                in one place.
              </p>

              <form onSubmit={submitSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search courses"
                    className="h-11 pl-9"
                    aria-label="Search courses"
                  />
                </div>
                <Button type="submit" className="h-11">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Course catalogue */}
        <section className="container py-14 md:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Available courses</h2>
              <p className="mt-2 text-muted-foreground">
                Browse courses available on the Greg-LMS platform.
              </p>
            </div>
            <Button variant="ghost" asChild>
             {/* <Link to="/courses">
                View all courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>*/}
            </Button>
          </div>

          {courses === null && !courseError && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-36 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {courseError && (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              {courseError}
            </div>
          )}

          {courses && courses.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No published courses are available yet.
            </div>
          )}

          {courses && courses.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="flex h-36 items-center justify-center bg-primary/10">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap gap-2">
                      {course.category && <Badge variant="secondary">{course.category}</Badge>}
                      {course.level && <Badge variant="outline">{course.level}</Badge>}
                    </div>
                    <h3 className="font-semibold leading-snug group-hover:text-primary">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor_name || 'Instructor'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration || 'Flexible'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Authentication call to action */}
        <section className="border-t bg-muted/30">
          <div className="container py-14 text-center">
            <h2 className="text-2xl font-bold">Ready to use Greg-LMS?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Sign in to access your learning dashboard, or create an account to start learning.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button size="lg" asChild>
                <Link to="/auth/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Greg-LMS Learning Management System
        </div>
      </footer>
    </div>
  );
}
