import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignmentService, AssignmentCreate } from '@/services/assignmentService';
import { courseService } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';

type AssignmentStatus = 'draft' | 'published' | 'closed';

interface Course {
  id: string;
  name: string;
}

interface AssignmentData {
  title: string;
  course_id: string;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  points: string;
  status: AssignmentStatus;
  file: File | null; // ✅ NEW
}

function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" "); // "01:01", "AM"
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(Number(hours) + 12);
  }

  return `${hours}:${minutes}`;
}


export default function CreateAssignment() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { toast } = useToast();

  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: '',
    course_id: '',
    description: '',
    instructions: '',
    dueDate: '',
    dueTime: '',
    points: '',
    status: 'draft',
    file: null // ✅ NEW
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      console.log("👉 Fetching assignment with ID:", assignmentId);
      const data = await assignmentService.getAssignment(assignmentId);
      console.log("✅ Raw assignment data from backend:", data);

      const due = new Date(data.due_date);

      setAssignmentData({
        title: data.title,
        course_id: data.course_id,
        description: data.description || '',
        instructions: data.instructions || '',
        dueDate: due.toISOString().split("T")[0],
        dueTime: due.toTimeString().slice(0, 5),
        points: data.total_points?.toString() || '0',
        status: data.status,
        file: null // existing file stays backend
      });

    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load assignment',
        variant: 'destructive'
      });
    }
  };

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { courses } = await courseService.getCourses();

        if (!courses || courses.length === 0) {
          setCourses([]);
          return;
        }

        const formattedCourses = courses.map((c: any) => ({
          id: c.id,
          name: c.title ?? c.name,
        }));

        setCourses(formattedCourses);

      } catch (err: any) {
        console.error(err);
        toast({
          title: 'Error',
          description: err?.message || 'Failed to load courses',
          variant: 'destructive'
        });
        setCourses([]);
      }
    };

    fetchCourses();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!assignmentData.course_id) {
        throw new Error("Please select a course");
      }

      const dueDateString = assignmentData.dueTime
        ? `${assignmentData.dueDate} ${assignmentData.dueTime}:00`
        : `${assignmentData.dueDate} 23:59:00`;

      // ✅ CREATE FORM DATA
      const formData = new FormData();

      formData.append("title", assignmentData.title);
      formData.append("description", assignmentData.description || "");
      formData.append("instructions", assignmentData.instructions || "");
      formData.append("course_id", assignmentData.course_id);
      formData.append("due_date", dueDateString);
      formData.append(
        "total_points",
        assignmentData.points ? assignmentData.points : "0"
      );
      formData.append("status", assignmentData.status);

      // ✅ OPTIONAL FILE
      if (assignmentData.file) {
        formData.append("file", assignmentData.file);
      }

      if (assignmentId) {
        await assignmentService.updateAssignment(assignmentId, formData);
      } else {
        await assignmentService.createAssignment(formData);
      }

      toast({
        title: 'Success',
        description:
          assignmentData.status === 'draft'
            ? 'Assignment saved as draft'
            : 'Assignment created successfully',
      });

      navigate(`/instructor/assignments`);

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create assignment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground">Create a new assignment or assessment for your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter assignment title"
                      value={assignmentData.title}
                      onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* course and Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={assignmentData.course_id}
                      onValueChange={(value) =>
                        setAssignmentData({ ...assignmentData, course_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Total Points</Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="100"
                      value={assignmentData.points}
                      onChange={(e) => setAssignmentData({ ...assignmentData, points: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the assignment"
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Detailed instructions for students"
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Assignment File (PDF only)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file && file.type !== "application/pdf") {
                        toast({
                          title: "Invalid file",
                          description: "Only PDF files are allowed",
                          variant: "destructive"
                        });
                        return;
                      }

                      setAssignmentData({ ...assignmentData, file: file || null });
                    }}
                  />
                  {assignmentData.file && (
                    <p className="text-sm text-green-600">
                      Selected: {assignmentData.file.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Due Date & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Due Date & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={assignmentData.dueDate}
                      onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={assignmentData.dueTime}
                      onChange={(e) => setAssignmentData({ ...assignmentData, dueTime: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Assignment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points:</span>
                  <span>{assignmentData.points || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due:</span>
                  <span>{assignmentData.dueDate ? `${new Date(assignmentData.dueDate).toLocaleDateString()}${assignmentData.dueTime ? ` at ${assignmentData.dueTime}` : ''}` : 'Not set'}</span>
                </div>
              </CardContent>

              <CardContent className="p-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  onClick={() => setAssignmentData({ ...assignmentData, status: 'published' })}
                >
                  <Save className="mr-2 h-4 w-4" /> {assignmentId ? "Save Changes" : "Create Assignment"}
                </Button>

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  onClick={() => setAssignmentData((prev) => ({ ...prev, status: 'draft' }))}
                >
                  Save as Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
