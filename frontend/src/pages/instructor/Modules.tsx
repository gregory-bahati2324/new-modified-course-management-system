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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LessonPreview } from '@/components/LessonPreview';
import { SortableModule } from '@/components/SortableModule';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { moduleService, type Module, type Lesson } from '@/services/moduleService';
import { lessonService } from '@/services/lessonService';
import { courseService, type Course } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import { colleges, departments, levels, courseTypes, getDepartmentsByCollege } from '@/data/universityStructure';

export default function InstructorModules() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // -------------------------
  // Filters & selections
  // -------------------------
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // -------------------------
  // Modules & lessons
  // -------------------------
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------
  // Dialogs
  // -------------------------
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    order: 1,
    course_id: '',
  });

  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // -------------------------
  // DnD Sensors
  // -------------------------
  const sensors = useSensors(useSensor(PointerSensor));

  // ================================================================
  // Effects: load filters
  // ================================================================
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

  useEffect(() => {
    if (selectedCollege && selectedDepartment && selectedLevel && selectedCourseType) {
      (async () => {
        try {
          const { courses } = await courseService.getMyCourses({
            college: selectedCollege,
            department: selectedDepartment,
            level: selectedLevel,
            type: selectedCourseType,
          });
          setCourses(courses);
          setSelectedCourseId('');
        } catch {
          toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        }
      })();
    }
  }, [selectedCollege, selectedDepartment, selectedLevel, selectedCourseType]);

  useEffect(() => {
    if (selectedCourseId) loadModules();
  }, [selectedCourseId]);

  // ================================================================
  // Load Modules + Lessons
  // ================================================================
  const loadModules = async () => {
    try {
      setLoading(true);
      const { data: modulesData } = await moduleService.getModules(selectedCourseId);
      setModules(modulesData || []);
      modulesData?.forEach((m) => m.id && loadLessons(m.id));
    } catch {
      toast({ title: 'Error', description: 'Failed to load modules', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (moduleId: string) => {
    try {
      const { data } = await lessonService.getLessons(moduleId);
      // lightweight mapping for lesson preview icons
      const lessons: Lesson[] = data.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        module_id: lesson.module_id,

      }));
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, lessons } : m))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreviewLesson = async (lessonId: string) => {
    try {
      const lesson = await lessonService.getLesson(lessonId);
      setPreviewLesson({
        lessonData: lesson,
        contentBlocks: lesson.contentBlocks || [],
        quizQuestions: lesson.quizQuestions || [],
      });
      setShowPreview(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to load lesson preview', variant: 'destructive' });
    }
  };

  // ================================================================
  // CRUD: Module
  // ================================================================
  const handleCreateModule = async () => {
    try {
      await moduleService.createModule({ ...newModule, course_id: selectedCourseId });
      toast({ title: 'Success', description: 'Module created successfully' });
      setIsCreateModuleOpen(false);
      loadModules();
    } catch {
      toast({ title: 'Error', description: 'Failed to create module', variant: 'destructive' });
    }
  };

  const handleOpenEditModule = (module: Module) => {
    setEditingModule(module);
    setNewModule({
      title: module.title,
      description: module.description || '',
      order: module.order || 1,
      course_id: module.course_id,
    });
    setIsEditModuleOpen(true);
  };

  const handleSaveEditModule = async () => {
    if (!editingModule) return;
    try {
      await moduleService.updateModule(editingModule.id, { ...newModule, course_id: selectedCourseId });
      toast({ title: 'Success', description: 'Module updated successfully' });
      setIsEditModuleOpen(false);
      setEditingModule(null);
      loadModules();
    } catch {
      toast({ title: 'Error', description: 'Failed to update module', variant: 'destructive' });
    }
  };



  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await moduleService.deleteModule(moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      toast({ title: 'Module deleted successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete module', variant: 'destructive' });
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    try {
      await lessonService.deleteLesson(lessonId);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
        )
      );
      toast({ title: 'Lesson deleted successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete lesson', variant: 'destructive' });
    }
  };

  // ================================================================
  // DnD Handlers: Modules + Lessons
  // ================================================================
  const handleDragEnd = async (event: DragEndEvent, moduleId?: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (moduleId) {
      // Lessons reordering
      setModules((prevModules) => {
        const moduleIndex = prevModules.findIndex((m) => m.id === moduleId);
        if (moduleIndex === -1) return prevModules;

        const module = prevModules[moduleIndex];
        const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
        const newIndex = module.lessons.findIndex((l) => l.id === over.id);
        console.log(`Dragging lesson id=${active.id} from index=${oldIndex} to index=${newIndex}`);

        const updatedLessons = arrayMove(module.lessons, oldIndex, newIndex);
        console.log('Updated lessons:', updatedLessons.map(l => ({ id: l.id, title: l.title })));

        // Correct payload for backend
        const payload = {
          lessons: updatedLessons.map((l, idx) => ({
            lesson_id: l.id,
            order: idx + 1, // 1-based index if your backend expects it
          })),
        };

        lessonService.reorderLessons(moduleId, payload)
          .catch(() =>
            toast({
              title: 'Error',
              description: 'Failed to reorder lessons',
              variant: 'destructive',
            })
          );

        const updatedModules = [...prevModules];
        updatedModules[moduleIndex] = { ...module, lessons: updatedLessons };
        return updatedModules;
      });
    } else {
      // Modules reordering
      setModules((prevModules) => {
        const oldIndex = prevModules.findIndex((m) => m.id === active.id);
        const newIndex = prevModules.findIndex((m) => m.id === over.id);
        const updatedModules = arrayMove(prevModules, oldIndex, newIndex);

        // Correct payload for backend
        const payload = {
          modules: updatedModules.map((m, idx) => ({
            module_id: m.id,
            order: idx, // 0-based index
          })),
        };

        moduleService.reorderModules(payload)
          .catch(() => toast({
            title: 'Error',
            description: 'Failed to reorder modules',
            variant: 'destructive'
          }));

        return updatedModules;
      });
    }
  };


  const filteredModules = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ================================================================
  // Render
  // ================================================================
  return (
    <InstructorLayout>
      <DndContext sensors={sensors} collisionDetection={closestCenter}
        onDragEnd={(event) => {
          // Check if lesson has moduleId
          const moduleId = (event.active.data.current as any)?.moduleId;
          handleDragEnd(event, moduleId);
        }}>
        <div className="container mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold">Manage Modules</h1>

          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Course Filters</CardTitle>
              <CardDescription>Select college, department, level, type & course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* College */}
              <div className="space-y-2">
                <Label>College</Label>
                <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                  <SelectTrigger><SelectValue placeholder="Choose a college..." /></SelectTrigger>
                  <SelectContent>{colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Department */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedCollege}>
                  <SelectTrigger><SelectValue placeholder="Choose department..." /></SelectTrigger>
                  <SelectContent>{filteredDepartments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Level */}
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedDepartment}>
                  <SelectTrigger><SelectValue placeholder="Choose level..." /></SelectTrigger>
                  <SelectContent>{levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Type */}
              <div className="space-y-2">
                <Label>Course Type</Label>
                <Select value={selectedCourseType} onValueChange={setSelectedCourseType} disabled={!selectedLevel}>
                  <SelectTrigger><SelectValue placeholder="Choose type..." /></SelectTrigger>
                  <SelectContent>{courseTypes.map((ct) => <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Course */}
              {selectedCourseType && (
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger><SelectValue placeholder="Choose course..." /></SelectTrigger>
                    <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search & Add Module */}
          {selectedCourseId && (
            <Card>
              <CardContent className="flex flex-col md:flex-row gap-4 pt-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search modules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Module</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Module</DialogTitle>
                      <DialogDescription>Add a module to organize lessons</DialogDescription>
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

                <Dialog open={isEditModuleOpen} onOpenChange={setIsEditModuleOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Module</DialogTitle>
                      <DialogDescription>Update module details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={newModule.title}
                          onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newModule.description}
                          onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={newModule.order}
                          onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditModuleOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveEditModule}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          )}

          {/* Modules List */}
          {loading ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Loading modules...</p></div>
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
            <SortableContext items={filteredModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {filteredModules.map((module, index) => (
                <SortableModule
                  key={module.id}
                  module={module}
                  moduleIndex={index}
                  selectedCourseId={selectedCourseId}
                  handlePreviewLesson={handlePreviewLesson}
                  handleDeleteLesson={handleDeleteLesson}
                  handleDeleteModule={handleDeleteModule}
                  handleEditModule={handleOpenEditModule}
                />
              ))}
            </SortableContext>
          )}

          {/* Lesson Preview Modal */}
          {showPreview && previewLesson && (
            <LessonPreview
              lessonData={previewLesson.lessonData}
              contentBlocks={previewLesson.contentBlocks}
              quizQuestions={previewLesson.quizQuestions}
              onClose={() => setShowPreview(false)}
            />
          )}
        </div>
      </DndContext>
    </InstructorLayout>
  );
}
