import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  FileText,
  Video,
  FileQuestion,
  Trash2,
  GripVertical,
  Eye,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { moduleService } from '@/services/moduleService';
import { courseService } from '@/services/courseService';
// import { lessonService } from '@/services/lessonService';
import type { Module, Lesson } from '@/services/moduleService';
import api from '@/services/api';
import type { Course } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  colleges,
  departments,
  levels,
  courseTypes,
  getDepartmentsByCollege,
} from '@/data/universityStructure';
import { lessonService } from '@/services/lessonService';
import { LessonPreview } from '@/components/LessonPreview';

/// -------------------------
// Load Real Data (NO MOCKS)
// -------------------------

export default function InstructorModules() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // -------------------------
  // States
  // -------------------------
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  // per-module lesson-loading flags
  const [loadingLessons, setLoadingLessons] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    order: 1,
    course_id: '',
  });

  // ================================================================
  // EFFECTS
  // ================================================================

  // Reset filters when college changes
  useEffect(() => {
    if (selectedCollege) {
      setFilteredDepartments(getDepartmentsByCollege(selectedCollege));
      setSelectedDepartment('');
      setSelectedLevel('');
      setSelectedCourseType('');
      setSelectedCourseId('');
      setCourses([]);
      setModules([]);
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedCollege]);

  // Load courses when all filters are selected
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { courses } = await courseService.getMyCourses({
          college: selectedCollege,
          department: selectedDepartment,
          level: selectedLevel,
          type: selectedCourseType,
        });

        setCourses(courses);
        setSelectedCourseId('');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load courses',
          variant: 'destructive',
        });
        console.error(error);
      }
    };

    if (selectedCollege && selectedDepartment && selectedLevel && selectedCourseType) {
      loadCourses();
    }
  }, [selectedCollege, selectedDepartment, selectedLevel, selectedCourseType]);

  // Load modules when a course is selected
  useEffect(() => {
    if (selectedCourseId) loadModules();
  }, [selectedCourseId]);

  // ================================================================
  // LOAD MODULES + ATTACH LESSONS
  // ================================================================
  const loadModules = async () => {
    try {
      setLoading(true);

      // fetch modules
      const { data: modulesData } = await moduleService.getModules(selectedCourseId);

      // set modules quickly (lessons will be attached later)
      setModules(modulesData || []);

      // load lessons for each module (fire-and-forget; each updates modules state when done)
      if (modulesData && modulesData.length) {
        modulesData.forEach((m: Module) => {
          // ensure module id exists
          if (m?.id) loadLessonsForModule(m.id);
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load modules',
        variant: 'destructive',
      });
      console.error('loadModules error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonsForModule = async (moduleId: string) => {
    try {
      const response = await lessonService.getLessons(moduleId);
      console.log("Loading lessons for module:", moduleId);

      // Convert heavy lessons → simple lightweight lesson objects
      const lessons: Lesson[] = response.data.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        module_id: lesson.module_id,

      }));




      // Update the module safely with correct type
      setModules(prev =>
        prev.map(m =>
          m.id === moduleId ? { ...m, lessons } : m
        )
      );

    } catch (error) {
      console.error(error);
    }
  };

  const handlePreviewLesson = async (lessonId: string) => {
    try {
      const lesson = await lessonService.getLesson(lessonId); // already Lesson object

      setPreviewLesson({
        lessonData: lesson,           // pass the full object
        contentBlocks: lesson.contentBlocks || [],  // use raw array
        quizQuestions: lesson.quizQuestions || [],  // use raw array
      });

      setShowPreview(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load lesson preview',
        variant: 'destructive',
      });
      console.error(error);
    }
  };





  // ================================================================
  // CREATE MODULE AND EDIT MODULE
  // ================================================================
  async function handleCreateModule() {
    try {
      await moduleService.createModule({
        title: newModule.title,
        description: newModule.description,
        order: newModule.order,
        course_id: selectedCourseId,   // REQUIRED
      });

      toast({
        title: "Success",
        description: "Module created successfully",
      });

      setIsCreateModuleOpen(false);
      loadModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      });

    }
  }

  async function handleEditModule(moduleId) {
    try {
      await moduleService.updateModule(moduleId, {
        title: newModule.title,
        description: newModule.description,
        order: newModule.order,
        course_id: selectedCourseId,   // REQUIRED
      });

      toast({
        title: "Success",
        description: "Module Edited successfully",
      });

      setIsEditModuleOpen(false);
      loadModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      });

    }
  }

  // ================================================================
  // DELETE MODULE
  // ================================================================
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      await moduleService.deleteModule(moduleId);

      setModules((prev) => prev.filter((m) => m.id !== moduleId));

      toast({ title: 'Module deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete module',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // ================================================================
  // DELETE LESSON
  // ================================================================
  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    try {
      await lessonService.deleteLesson(lessonId);

      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      );

      toast({ title: 'Lesson deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lesson',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // ================================================================
  // HELPERS
  // ================================================================
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'reading':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase())

  );

  return (
    <InstructorLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Modules</h1>
            <p className="text-muted-foreground">Organize your course content</p>
          </div>
        </div>

        {/* Course Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Course Filtering
            </CardTitle>
            <CardDescription>
              Select college, department, level, and course type to view courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* College */}
            <div className="space-y-2">
              <Label>1. Select College</Label>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger><SelectValue placeholder="Choose a college..." /></SelectTrigger>
                <SelectContent>
                  {colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>2. Select Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedCollege}>
                <SelectTrigger><SelectValue placeholder="Choose department..." /></SelectTrigger>
                <SelectContent>
                  {filteredDepartments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>3. Select Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedDepartment}>
                <SelectTrigger><SelectValue placeholder="Choose level..." /></SelectTrigger>
                <SelectContent>
                  {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Course Type */}
            <div className="space-y-2">
              <Label>4. Select Course Type</Label>
              <Select value={selectedCourseType} onValueChange={setSelectedCourseType} disabled={!selectedLevel}>
                <SelectTrigger><SelectValue placeholder="Choose course type..." /></SelectTrigger>
                <SelectContent>
                  {courseTypes.map((ct) => <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Course */}
            {selectedCourseType && (
              <div className="space-y-2">
                <Label>5. Select Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger><SelectValue placeholder="Choose a course..." /></SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search & Add Module */}
        {selectedCourseId && (
          <Card>
            <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Module</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                    <DialogDescription>Add a new module to organize your lessons</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Title</Label><Input value={newModule.title} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} /></div>
                    <div><Label>Description</Label><Textarea value={newModule.description} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} /></div>
                    <div><Label>Order</Label><Input type="number" value={newModule.order} onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) })} /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateModuleOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateModule}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Modules List */}
        {loading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading modules...</p></div>
        ) : !selectedCourseId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No course selected</h3>
              <p className="text-muted-foreground">Please select a course to manage its modules</p>
            </CardContent>
          </Card>
        ) : filteredModules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">{searchQuery ? 'Try adjusting your search' : 'Create your first module to get started'}</p>
              {!searchQuery && <Button onClick={() => setIsCreateModuleOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Module</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredModules.map((module, index) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg">
                  <Card>
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="flex items-center gap-4 w-full">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Module {index + 1}</Badge>
                            <h3 className="font-semibold">{module.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{module.lessons?.length || 0} lessons</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Lessons</h4>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => navigate(`/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson`)}><Plus className="h-4 w-4 mr-2" />Add Lesson</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteModule(module.id)}><Trash2 className="h-4 w-4" /></Button>
                            <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
                              <DialogTrigger asChild>
                                <Button><Plus className="h-4 w-4 mr-2" />Edit Module</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit {module.title} </DialogTitle>
                                  <DialogDescription>Edit {module.title} to organize your lessons</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div><Label>Title</Label><Input value={newModule.title} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} /></div>
                                  <div><Label>Description</Label><Textarea value={newModule.description} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} /></div>
                                  <div><Label>Order</Label><Input type="number" value={newModule.order} onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) })} /></div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsCreateModuleOpen(false)}>Cancel</Button>
                                  <Button onClick={() => handleEditModule(module.id)}>Edit</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>



                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{lesson.title}</h5>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handlePreviewLesson(lesson.id)}><Eye className="h-4 w-4" /></Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(`/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson/${lesson.id}`)}
                                  >
                                    Edit
                                  </Button>

                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.id, module.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-lg bg-muted/50">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No lessons yet</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

      {showPreview && previewLesson && (
        <LessonPreview
          lessonData={previewLesson.lessonData}
          contentBlocks={previewLesson.contentBlocks}
          quizQuestions={previewLesson.quizQuestions}
          onClose={() => setShowPreview(false)}
        />
      )}
    </InstructorLayout>
  );
}
