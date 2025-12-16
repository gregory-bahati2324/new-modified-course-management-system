import { useEffect, useState, useMemo } from 'react';
import { courseService, Course } from '@/services/courseService';
import {
    Search,
    Filter,
    GraduationCap,
    BookOpen,
    Clock,
    Users,
    User,
    Star,
    CheckCircle,
    Building2,
    Layers,
    Calendar
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
import { colleges, departments, levels, courseTypes, getDepartmentsByCollege } from '@/data/universityStructure';

const years = [
    { id: '1', name: 'Year 1' },
    { id: '2', name: 'Year 2' },
    { id: '3', name: 'Year 3' },
    { id: '4', name: 'Year 4' },
    { id: '5', name: 'Year 5' },
];

const semesters = [
    { id: '1', name: 'Semester 1' },
    { id: '2', name: 'Semester 2' },
];

export default function Enrollment() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedCourseType, setSelectedCourseType] = useState<string>('');
    const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

    const extractYearFromDuration = (duration?: string): string | null => {
        if (!duration) return null;

        const match = duration.match(/Year\s(\d+)/i);
        return match ? match[1] : null;
    };

    const extractSemesterFromDuration = (duration?: string): string | null => {
        if (!duration) return null;

        const match = duration.match(/Semester\s(\d+)/i);
        return match ? match[1] : null;
    };


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

            // College filter
            const matchesCollege = selectedCollege ? course.category === selectedCollege : true;

            // Department filter
            const matchesDepartment = selectedDepartment ? course.department === selectedDepartment : true;

            // Level filter
            const matchesLevel = selectedLevel ? course.level === selectedLevel : true;

            // Year & Semester filters (only for normal courses)
            const courseYear = extractYearFromDuration(course.duration);
            const courseSemester = extractSemesterFromDuration(course.duration);

            const matchesYear =
                selectedCourseType !== 'short' && selectedYear
                    ? courseYear === selectedYear
                    : true;

            const matchesSemester =
                selectedCourseType !== 'short' && selectedSemester
                    ? courseSemester === selectedSemester
                    : true;

            return matchesSearch && matchesCollege && matchesDepartment &&
                matchesLevel && matchesYear && matchesSemester;
        });
    }, [
        courses,
        searchQuery,
        selectedCollege,
        selectedDepartment,
        selectedLevel,
        selectedYear,
        selectedSemester,
        selectedCourseType
    ]);
    const displayedCourses = filteredCourses;

    // Get departments based on selected college
    const availableDepartments = useMemo(() => {
        if (!selectedCollege) return [];
        return getDepartmentsByCollege(selectedCollege);
    }, [selectedCollege]);

    // Filter courses based on all criteria
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                const { courses } = await courseService.getStudentFilteredCourses({
                    category: selectedCollege || '',
                    department: selectedDepartment || '',
                    level: selectedLevel || '',
                    type: selectedCourseType || '',
                    duration: '',
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
        selectedCollege,
        selectedDepartment,
        selectedLevel,
        selectedCourseType,
    ]);

    // Reset department when college changes
    const handleCollegeChange = (value: string) => {
        setSelectedCollege(value);
        setSelectedDepartment('');
    };

    // Handle enrollment
    const handleEnroll = (courseId: string, courseTitle: string) => {
        if (enrolledCourses.includes(courseId)) {
            toast({
                title: "Already Enrolled",
                description: `You are already enrolled in ${courseTitle}.`,
                variant: "destructive",
            });
            return;
        }

        setEnrolledCourses(prev => [...prev, courseId]);
        toast({
            title: "Enrollment Successful!",
            description: `You have successfully enrolled in ${courseTitle}.`,
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCollege('');
        setSelectedDepartment('');
        setSelectedLevel('');
        setSelectedYear('');
        setSelectedSemester('');
        setSelectedCourseType('');
        setSearchQuery('');
    };

    const getCollegeName = (id: string) => colleges.find(c => c.id === id)?.shortName || '';
    const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || '';

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
                        Browse and enroll in courses from your college and department
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
                        Select your college and department to find available courses
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* College Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                College
                            </label>
                            <Select value={selectedCollege} onValueChange={handleCollegeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select College" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {colleges.map(college => (
                                        <SelectItem key={college.id} value={college.id}>
                                            {college.shortName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Department Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <Layers className="h-4 w-4" />
                                Department
                            </label>
                            <Select
                                value={selectedDepartment}
                                onValueChange={setSelectedDepartment}
                                disabled={!selectedCollege}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedCollege ? "Select Department" : "Select College First"} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {availableDepartments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name.replace('Department of ', '')}
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
                                        <SelectItem key={level.id} value={level.id}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year Filter */}
                        {selectedCourseType !== 'short' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Year of Study
                                </label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover z-50">
                                        {years.map(year => (
                                            <SelectItem key={year.id} value={year.id}>
                                                {year.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Semester Filter */}
                        {selectedCourseType !== 'short' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Semester
                                </label>
                                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Semester" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover z-50">
                                        {semesters.map(sem => (
                                            <SelectItem key={sem.id} value={sem.id}>
                                                {sem.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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
            {(selectedCollege || selectedDepartment || selectedLevel || selectedYear || selectedSemester || selectedCourseType) && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {selectedCollege && (
                        <Badge variant="secondary">{getCollegeName(selectedCollege)}</Badge>
                    )}
                    {selectedDepartment && (
                        <Badge variant="secondary">{getDepartmentName(selectedDepartment).replace('Department of ', '')}</Badge>
                    )}
                    {selectedLevel && (
                        <Badge variant="secondary">{levels.find(l => l.id === selectedLevel)?.name}</Badge>
                    )}
                    {selectedYear && (
                        <Badge variant="secondary">{years.find(y => y.id === selectedYear)?.name}</Badge>
                    )}
                    {selectedSemester && (
                        <Badge variant="secondary">{semesters.find(s => s.id === selectedSemester)?.name}</Badge>
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
                        const isFull = course.students_enrolled >= (course.max_students || 0);

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
                                        <span>{getCollegeName(course.category)}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {course.description}
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{course.instructor_name || "Gregory"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.duration}</span>
                                            <span>•</span>

                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />

                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t">
                                    <Button
                                        className="w-full"
                                        variant={isEnrolled ? "secondary" : "default"}
                                        disabled={isEnrolled || isFull}
                                        onClick={() => handleEnroll(course.id, course.title)}
                                    >
                                        {isEnrolled ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Enrolled
                                            </>
                                        ) : isFull ? (
                                            'Course Full'
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