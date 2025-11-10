import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  FileText,
  Video,
  FileQuestion,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstructorLayout } from "@/components/layout/InstructorLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { moduleService } from "@/services/moduleService";
import { courseService } from "@/services/courseService_fake";
import type { Module } from "@/services/moduleService";
import type { Course } from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

export default function InstructorModules() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) loadModules();
  }, [selectedCourseId]);

  // Load instructor's courses
  const loadCourses = async () => {
    try {
      const response = await courseService.getCourses({});
      setCourses(response.courses);
      if (response.courses.length > 0) {
        setSelectedCourseId(response.courses[0].id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  // Load modules for selected course
  const loadModules = async () => {
    try {
      setLoading(true);
      const data = await moduleService.getModulesByCourse(selectedCourseId);
      setModules(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new module
  const handleCreateModule = async () => {
    try {
      await moduleService.createModule({
        ...newModule,
        course_id: selectedCourseId,
      });
      toast({
        title: "Success",
        description: "Module created successfully",
      });
      setIsCreateModuleOpen(false);
      setNewModule({ title: "", description: "", order: 0 });
      loadModules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      });
    }
  };

  // Delete a module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      await moduleService.deleteModule(moduleId);
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      loadModules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  // Delete a lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await moduleService.deleteLesson(lessonId);
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      loadModules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  // Icon for lesson types
  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "reading":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Filter modules by search query
  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Course Selection & Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Select Course */}
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Add Module */}
              <Dialog
                open={isCreateModuleOpen}
                onOpenChange={setIsCreateModuleOpen}
              >
                <DialogTrigger asChild>
                  <Button disabled={!selectedCourseId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                    <DialogDescription>
                      Add a new module to organize your lessons
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="module-title">Title</Label>
                      <Input
                        id="module-title"
                        value={newModule.title}
                        onChange={(e) =>
                          setNewModule({ ...newModule, title: e.target.value })
                        }
                        placeholder="Module title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="module-description">Description</Label>
                      <Textarea
                        id="module-description"
                        value={newModule.description}
                        onChange={(e) =>
                          setNewModule({
                            ...newModule,
                            description: e.target.value,
                          })
                        }
                        placeholder="Module description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="module-order">Order</Label>
                      <Input
                        id="module-order"
                        type="number"
                        value={newModule.order}
                        onChange={(e) =>
                          setNewModule({
                            ...newModule,
                            order: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateModuleOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateModule}>Create Module</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading modules...</p>
          </div>
        ) : !selectedCourseId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No course selected</h3>
              <p className="text-muted-foreground">
                Please select a course to manage its modules
              </p>
            </CardContent>
          </Card>
        ) : filteredModules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Create your first module to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateModuleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredModules.map((module, index) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border rounded-lg"
                >
                  <Card>
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="flex items-center gap-4 w-full">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              Module {index + 1}
                            </Badge>
                            <h3 className="font-semibold">{module.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {module.lessons?.length || 0} lessons
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="px-6 pb-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Lessons</h4>
                          <div className="flex gap-2">
                            {/* 🧭 Navigate to Add Lesson Page */}
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/instructor/course/${selectedCourseId}/module/${module.id}/add-lesson`
                                )
                              }
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Lesson
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Lessons List */}
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <div className="flex items-center gap-2">
                                  {getLessonIcon(lesson.type)}
                                  <Badge variant="outline" className="text-xs">
                                    {lessonIndex + 1}
                                  </Badge>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">
                                    {lesson.title}
                                  </h5>
                                  <p className="text-xs text-muted-foreground">
                                    {lesson.type}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {lesson.duration || 0} min
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteLesson(lesson.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-lg bg-muted/50">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No lessons yet
                            </p>
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
    </InstructorLayout>
  );
}
