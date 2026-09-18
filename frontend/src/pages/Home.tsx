import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { courseService, type Course } from '@/services/courseService';
import heroImage from '@/assets/hero-image.jpg';

export default function Home() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    courseService.getPublicCourses(8)
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) {
          setCourseError('Courses could not be loaded. Please try again later.');
        }
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

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public navigation */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-bold leading-none">Greg-LMS</div>
              <div className="hidden text-xs text-muted-foreground sm:block">
                Learning Management System
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            

            <nav className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link to="/courses">Courses</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
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
        </div>
      </header>

      <main>
        {/* Image-backed learning hero */}
        <section className="relative isolate min-h-[620px] overflow-hidden md:min-h-[680px]">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 -z-10 bg-slate-950/15" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/55 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" /> <div className="container flex min-h-[620px] items-center py-16 md:min-h-[680px] md:py-20">
            <div className="max-w-3xl text-white">
              <Badge
                variant="outline"
                className="mb-6 border-white/30 bg-white/10 px-4 py-1.5 text-white backdrop-blur-md"
              >
                Greg-LMS Learning Platform
              </Badge>

              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Learn. Grow.{' '}
                <span className="text-blue-200">Achieve.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
                Access your courses, learning materials, assignments, assessments and
                progress in one place — designed to make learning simpler and more connected.
              </p>

              <form
                onSubmit={submitSearch}
                className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
              >
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search for a course..."
                    aria-label="Search courses"
                    className="h-12 border-white/20 bg-white/95 pl-12 text-slate-900 shadow-xl placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-white"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 shrink-0 bg-primary px-7 shadow-xl hover:bg-primary/90"
                >
                  Search
                </Button>
              </form>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/80">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  Courses
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  Learning materials
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  Progress tracking
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Course catalogue */}
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Start learning
              </p>
              <h2 className="text-2xl font-bold md:text-3xl">Available courses</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Browse courses available on the Greg-LMS platform.
              </p>
            </div>
            
          </div>

          {courses === null && !courseError && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {courseError && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              {courseError}
            </div>
          )}

          {courses && courses.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No published courses are available yet.
            </div>
          )}

          {courses && courses.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-40 items-center justify-center bg-primary/10">
                    <BookOpen className="h-12 w-12 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="space-y-3 p-5">
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
          <div className="container py-16 text-center md:py-20">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Your learning journey starts here
            </p>
            <h2 className="text-2xl font-bold md:text-3xl">Ready to use Greg-LMS?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Sign in to access your learning dashboard, or create an account to start learning.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button size="lg" asChild>
                <Link to="/auth/register">Create an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-7">
        <div className="container text-center text-sm text-muted-foreground">
          Greg-LMS Learning Management System
        </div>
      </footer>
    </div>
  );
}
