import { useEffect, useState, useMemo } from 'react';
import { courseService, Course } from '@/services/courseService';
import {
    Search,
    Filter,
    GraduationCap,
    BookOpen,
    Clock,
    User,
    CheckCircle,
    Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { categories, levels, courseTypes } from '@/data/learningStructure';

export default function Enrollment() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedCourseType, setSelectedCourseType] = useState<string>('');
    const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Course Type filter
            if (selectedCourseType) {
                if (selectedCourseType === 'short' && course.course_type !== 'short') return false;
                if (selectedCourseType !== 'short' && course.course_type === 'short') return false;
            }

            // Search query filter
            const matchesSearch =
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

            // Category filter
            const matchesCategory = selectedCategory ? course.category === selectedCategory : true;

            // Level filter
            const matchesLevel = selectedLevel ? course.level === selectedLevel : true;

            return matchesSearch && matchesCategory && matchesLevel;
        });
    }, [
        courses,
        searchQuery,
        selectedCategory,
        selectedLevel,
        selectedCourseType
    ]);
    const displayedCourses = filteredCourses;

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const enrollments = await courseService.getStudentEnrollments();

                // Store only course IDs
                const courseIds = enrollments.map(e => e.course_id);

                setEnrolledCourses(courseIds);
            } catch (error) {
                console.error("Failed to fetch enrollments", error);
            }
        };

        fetchEnrollments();
    }, []);


    // Filter courses based on all criteria
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                const { courses } = await courseService.getStudentFilteredCourses({
                    category: selectedCategory || '',
                    level: selectedLevel || '',
                    type: selectedCourseType || '',
                });

                setCourses(courses);
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to load courses',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [
        selectedCategory,
        selectedLevel,
        selectedCourseType,
    ]);

    // Handle enrollment
    const handleEnroll = async (courseId: string, courseTitle: string) => {
        if (enrolledCourses.includes(courseId)) return;

        try {
            await courseService.createEnrollment(courseId);

            setEnrolledCourses(prev => [...prev, courseId]);

            toast({
                title: "Enrollment Successful",
                description: `You are enrolled in ${courseTitle}`,
            });
        } catch (error: any) {
            toast({
                title: "Enrollment Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };



    // Clear all filters
    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedLevel('');
        setSelectedCourseType('');
        setSearchQuery('');
    };

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        Course Enrollment
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and enroll in courses across the platform
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                        {enrolledCourses.length} Enrolled
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                        {displayedCourses.length} Courses Available
                    </Badge>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filter Courses
                    </CardTitle>
                    <CardDescription>
                        Filter by category, level, or course type to find what you're looking for
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by course name, code, or instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <Layers className="h-4 w-4" />
                                Category
                            </label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Level Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                Level
                            </label>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {levels.map(level => (
                                        <SelectItem key={level.id} value={level.name}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Course Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                Course Type
                            </label>
                            <Select value={selectedCourseType} onValueChange={setSelectedCourseType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {courseTypes.map(type => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={clearFilters} size="sm">
                            Clear All Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Active Filters Display */}
            {(selectedCategory || selectedLevel || selectedCourseType) && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {selectedCategory && (
                        <Badge variant="secondary">{selectedCategory}</Badge>
                    )}
                    {selectedLevel && (
                        <Badge variant="secondary">{selectedLevel}</Badge>
                    )}
                    {selectedCourseType && (
                        <Badge variant="secondary">{courseTypes.find(t => t.id === selectedCourseType)?.name}</Badge>
                    )}
                </div>
            )}

            {/* Course Grid */}
            {displayedCourses.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                        <div>
                            <h3 className="text-lg font-semibold">No Courses Found</h3>
                            <p className="text-muted-foreground mt-1">
                                Try adjusting your filters or search query to find courses.
                            </p>
                        </div>
                        <Button onClick={clearFilters} variant="outline">
                            Clear Filters
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedCourses.map(course => {
                        const isEnrolled = enrolledCourses.includes(course.id);

                        return (
                            <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <Badge variant={course.course_type === 'short' ? 'secondary' : 'default'}>
                                            {course.course_type === 'short' ? 'Short Course' : 'Regular Course'}
                                        </Badge>
                                        {isEnrolled && (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Enrolled
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg mt-2 line-clamp-2">{course.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{course.code}</span>
                                        <span>•</span>
                                        <span>{course.category || 'General'}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {course.description}
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{course.instructor_name || 'Instructor'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.duration}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t">
                                    <Button
                                        className="w-full"
                                        variant={isEnrolled ? "secondary" : "default"}
                                        disabled={isEnrolled}
                                        onClick={() => handleEnroll(course.id, course.title)}
                                    >
                                        {isEnrolled ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Enrolled
                                            </>
                                        ) : (
                                            'Enroll Now'
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}