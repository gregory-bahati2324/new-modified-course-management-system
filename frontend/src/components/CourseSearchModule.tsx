import { useState } from 'react';
import { Search, Plus, BookOpen, Users, Calendar, Building, School, Eye, Edit, UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  code: string;
  description: string;
  instructors: string[];
  students: number;
  status: 'published' | 'draft';
  department: string;
  college: string;
}

interface ModuleFormData {
  title: string;
  description: string;
  duration: string;
  order: string;
  objectives: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  instructor: string;
  week: number;
  duration: string;
  status: 'published' | 'draft';
  canEdit: boolean;
}

export function CourseSearchModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModulesPopupOpen, setIsModulesPopupOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'search' | 'course-detail'>('search');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModuleViewOpen, setIsModuleViewOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [moduleForm, setModuleForm] = useState<ModuleFormData>({
    title: '',
    description: '',
    duration: '',
    order: '',
    objectives: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock courses data with expanded colleges and departments
  const allCourses: Course[] = [
    {
      id: 1,
      title: "Advanced Database Systems",
      code: "CS 401",
      description: "Advanced concepts in database design, optimization, and distributed systems.",
      instructors: ["Dr. Sarah Johnson", "Prof. Michael Chen"],
      students: 45,
      status: "published",
      department: "Computer Science",
      college: "College of Engineering"
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      code: "CS 201",
      description: "Fundamental data structures and algorithmic problem-solving techniques.",
      instructors: ["Dr. Sarah Johnson", "Dr. James Wilson"],
      students: 67,
      status: "published",
      department: "Computer Science",
      college: "College of Engineering"
    },
    {
      id: 3,
      title: "Machine Learning Fundamentals",
      code: "CS 451",
      description: "Introduction to machine learning algorithms and applications.",
      instructors: ["Dr. Sarah Johnson"],
      students: 38,
      status: "published",
      department: "Computer Science",
      college: "College of Engineering"
    },
    {
      id: 4,
      title: "Software Engineering Principles",
      code: "CS 301",
      description: "Software development methodologies and project management.",
      instructors: ["Prof. Alice Brown", "Dr. Robert Lee"],
      students: 52,
      status: "draft",
      department: "Computer Science",
      college: "College of Engineering"
    },
    {
      id: 5,
      title: "Network Security",
      code: "CS 421",
      description: "Cybersecurity principles, encryption, and network protection.",
      instructors: ["Dr. Emily Davis"],
      students: 29,
      status: "published",
      department: "Computer Science",
      college: "College of Engineering"
    },
    {
      id: 6,
      title: "Financial Accounting",
      code: "ACC 101",
      description: "Introduction to financial accounting principles and practices.",
      instructors: ["Prof. Jennifer Smith"],
      students: 85,
      status: "published",
      department: "Accounting",
      college: "College of Business"
    },
    {
      id: 7,
      title: "Marketing Management",
      code: "MKT 301",
      description: "Strategic marketing concepts and consumer behavior analysis.",
      instructors: ["Dr. Mark Thompson"],
      students: 72,
      status: "published",
      department: "Marketing",
      college: "College of Business"
    },
    {
      id: 8,
      title: "Human Anatomy",
      code: "BIO 201",
      description: "Study of human body systems and physiological processes.",
      instructors: ["Dr. Lisa Chen", "Prof. David Martinez"],
      students: 156,
      status: "published",
      department: "Biology",
      college: "College of Sciences"
    },
    {
      id: 9,
      title: "Organic Chemistry",
      code: "CHEM 301",
      description: "Advanced organic chemistry reactions and mechanisms.",
      instructors: ["Dr. Robert Wilson"],
      students: 64,
      status: "published",
      department: "Chemistry",
      college: "College of Sciences"
    }
  ];

  // Get unique colleges and departments
  const colleges = Array.from(new Set(allCourses.map(course => course.college)));
  const departments = selectedCollege 
    ? Array.from(new Set(allCourses
        .filter(course => course.college === selectedCollege)
        .map(course => course.department)))
    : [];

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructors.some(instructor => 
        instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCollege = selectedCollege === '' || selectedCollege === 'all' || course.college === selectedCollege;
    const matchesDepartment = selectedDepartment === '' || selectedDepartment === 'all' || course.department === selectedDepartment;
    
    return matchesSearch && matchesCollege && matchesDepartment;
  });

  // Mock modules data for each course
  const getModulesForCourse = (courseId: number): Module[] => {
    const baseModules: Module[] = [
      {
        id: 1,
        title: "Introduction to Course Fundamentals",
        description: "Basic introduction covering fundamental concepts and overview of the course structure.",
        instructor: "Dr. Sarah Johnson",
        week: 1,
        duration: "2 weeks",
        status: "published",
        canEdit: true
      },
      {
        id: 2,
        title: "Advanced Concepts and Applications",
        description: "Deep dive into advanced topics with practical applications and real-world examples.",
        instructor: "Prof. Michael Chen",
        week: 3,
        duration: "3 weeks", 
        status: "published",
        canEdit: false
      },
      {
        id: 3,
        title: "Practical Implementation",
        description: "Hands-on implementation of concepts learned in previous modules.",
        instructor: "Dr. Sarah Johnson",
        week: 6,
        duration: "2 weeks",
        status: "draft",
        canEdit: true
      }
    ];
    
    return baseModules.map(module => ({
      ...module,
      id: module.id + (courseId * 100),
      title: module.title.replace("Course", allCourses.find(c => c.id === courseId)?.title.split(' ')[0] || "Course")
    }));
  };

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModulesPopupOpen(true);
  };

  const handleAddModuleNavigation = () => {
    if (selectedCourse) {
      navigate(`/instructor/course/${selectedCourse.id}/add-module?courseName=${encodeURIComponent(selectedCourse.title)}`);
    }
  };
  
  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleViewOpen(true);
    setIsModulesPopupOpen(false);
  };

  const handleEditModule = (module: Module) => {
    if (!module.canEdit) {
      setIsPermissionDialogOpen(true);
      return;
    }
    // Navigate to edit module page
    toast({
      title: "Edit Module",
      description: `Opening editor for "${module.title}"`,
    });
  };

  const handlePermissionRequest = () => {
    setPermissionRequested(true);
    // Simulate permission request
    setTimeout(() => {
      const approved = Math.random() > 0.5; // 50% chance of approval
      if (approved) {
        toast({
          title: "Permission Granted",
          description: "You can now edit this module.",
        });
        setIsPermissionDialogOpen(false);
        if (selectedModule && selectedCourse) {
          navigate(`/instructor/course/${selectedCourse.id}/add-module?courseName=${encodeURIComponent(selectedCourse.title)}&edit=1&moduleId=${selectedModule.id}`);
        }
      } else {
        toast({
          title: "Permission Denied",
          description: "Your request to edit this module was denied.",
          variant: "destructive"
        });
        setIsPermissionDialogOpen(false);
      }
      setPermissionRequested(false);
    }, 2000);
  };

  const handleAddModule = () => {
    if (!moduleForm.title || !moduleForm.description || !moduleForm.duration || !moduleForm.order) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate adding module
    toast({
      title: "Module Added Successfully",
      description: `"${moduleForm.title}" has been added to ${selectedCourse?.title}`,
    });

    // Reset form and close dialog
    setModuleForm({
      title: '',
      description: '',
      duration: '',
      order: '',
      objectives: ''
    });
    setIsAddModuleOpen(false);
  };

  const openAddModuleDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsAddModuleOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Add Module to Courses
          </CardTitle>
          <CardDescription>
            Search for existing courses and add new modules to them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>College</Label>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <Select 
                value={selectedDepartment} 
                onValueChange={setSelectedDepartment}
                disabled={!selectedCollege || selectedCollege === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Course Results */}
          {(selectedCollege || selectedDepartment || searchQuery) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {filteredCourses.length} course(s) found
              </h3>
              <div className="grid gap-4">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => selectCourse(course)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">{course.code}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{course.students} students</span>
                          </div>
                          <span>Instructors: {course.instructors.join(", ")}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                          <Badge variant="outline">{course.department}</Badge>
                          <Badge variant="outline">{course.college}</Badge>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex gap-2">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCourse(course);
                          }}
                          variant="outline"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Manage Modules
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(selectedCollege || selectedDepartment || searchQuery) && filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>No courses found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules Management Popup */}
      <Dialog open={isModulesPopupOpen} onOpenChange={setIsModulesPopupOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedCourse?.title} - Modules
            </DialogTitle>
            <DialogDescription>
              {selectedCourse?.college} - {selectedCourse?.department}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedCourse && getModulesForCourse(selectedCourse.id).length} modules found
              </div>
              <Button onClick={handleAddModuleNavigation}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Module
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedCourse && getModulesForCourse(selectedCourse.id).map((module) => (
                <div key={module.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{module.title}</h4>
                        <Badge variant={module.status === 'published' ? 'default' : 'secondary'}>
                          {module.status}
                        </Badge>
                        {module.canEdit && (
                          <Badge variant="outline" className="text-success">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Can Edit
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Week {module.week}</span>
                        <span>{module.duration}</span>
                        <span>Instructor: {module.instructor}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewModule(module)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditModule(module)}
                        
                      >
                        {module.canEdit ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </>
                        ) : (
                          "Request Permission"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModulesPopupOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module View Dialog */}
      <Dialog open={isModuleViewOpen} onOpenChange={setIsModuleViewOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {selectedModule?.title}
              </div>
              <div className="flex gap-2">
                {selectedModule?.canEdit && (
                  <Button size="sm" onClick={() => handleEditModule(selectedModule)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Module
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsModuleViewOpen(false);
                    setIsModulesPopupOpen(true);
                  }}
                >
                  Back to Modules
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedModule && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Week:</span> {selectedModule.week}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {selectedModule.duration}
                </div>
                <div>
                  <span className="font-medium">Instructor:</span> {selectedModule.instructor}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={selectedModule.status === 'published' ? 'default' : 'secondary'}>
                    {selectedModule.status}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Module Description</h4>
                <p className="text-muted-foreground">{selectedModule.description}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Module Content</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Module content would be displayed here (lessons, materials, assignments, etc.)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Request Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Edit Permission</DialogTitle>
            <DialogDescription>
              You don't have permission to edit this module. Would you like to request permission from the module owner?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Module: <span className="font-medium">{selectedModule?.title}</span><br/>
              Owner: <span className="font-medium">{selectedModule?.instructor}</span>
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePermissionRequest} disabled={permissionRequested}>
              {permissionRequested ? "Requesting..." : "Request Permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Module Dialog */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Add a new module to "{selectedCourse?.title}" ({selectedCourse?.code})
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                placeholder="Enter module title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select 
                  value={moduleForm.duration} 
                  onValueChange={(value) => setModuleForm({...moduleForm, duration: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="3-weeks">3 Weeks</SelectItem>
                    <SelectItem value="4-weeks">4 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="order">Week/Order *</Label>
                <Select 
                  value={moduleForm.order} 
                  onValueChange={(value) => setModuleForm({...moduleForm, order: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 16}, (_, i) => (
                      <SelectItem key={i + 1} value={`week-${i + 1}`}>
                        Week {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                value={moduleForm.objectives}
                onChange={(e) => setModuleForm({...moduleForm, objectives: e.target.value})}
                placeholder="Enter learning objectives (optional)"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}