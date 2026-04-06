import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FileText,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { assignmentService, StudentAssignment } from '@/services/assignmentService';
import { toast } from 'sonner';

export default function SubmitAssignment() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  /* CHANGE: Form state for submission */
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assignment, setAssignment] = useState<StudentAssignment | null>(null);
  const [loading, setLoading] = useState(true);


  const getDaysLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = assignment?.due_date
    ? getDaysLeft(assignment.due_date)
    : 0;

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;

      try {
        const data = await assignmentService.getStudentAssignment(assignmentId);
        setAssignment(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  /* CHANGE: File handling */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const MAX_SIZE_MB = 50;
    const maxSize = MAX_SIZE_MB * 1024 * 1024;

    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds the ${MAX_SIZE_MB}MB limit`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    if (ext === 'zip' || ext === 'rar') return '📦';
    if (ext === 'sql') return '🗃️';
    return '📎';
  };

  /* CHANGE: Submit handler */
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }
    if (!agreeToTerms) {
      toast.error('Please confirm your submission');
      return;
    }

    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(assignmentId || '1', {
        submission_text: description,
        files: files,
      });
      setSubmitted(true);
      toast.success('Assignment submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  /* CHANGE: Success state after submission */
  if (submitted) {
    return (
      <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
        <Card className="text-center">
          <CardContent className="pt-12 pb-12 space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Assignment Submitted!</h2>
              <p className="text-muted-foreground">
                Your assignment for <span className="font-medium text-foreground">{assignment.title}</span> has been submitted successfully.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
              <p><span className="text-muted-foreground">Submitted at:</span> {new Date().toLocaleString()}</p>
              <p><span className="text-muted-foreground">Files uploaded:</span> {files.length}</p>
              <p><span className="text-muted-foreground">Course:</span> {assignment.course_title}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/student/assignments')}>
                Back to Assignments
              </Button>
              <Button variant="outline" onClick={() => navigate(`/student/Myassignment/${assignmentId}/view`)}>
                View Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* CHANGE: Back navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/student/assignments/${assignmentId}/view`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Submit Assignment</h1>
        <p className="text-muted-foreground mt-1">{assignment.title} — {assignment.course_title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* CHANGE: File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Click to upload files</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or drag and drop your files here
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-3">
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {['.pdf', '.docx', '.zip', '.sql'].map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Max file size: 5 MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,.zip,.sql"
                onChange={handleFileSelect}
              />

              {/* CHANGE: Uploaded files list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files ({files.length})</Label>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(file.name)}</span>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CHANGE: Description & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description / Summary</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe what you're submitting, e.g. 'Database ER diagram + SQL scripts for the e-commerce project'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a brief summary of your submission
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional comments for your instructor, e.g. challenges faced, assumptions made, etc."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Share any relevant notes with your instructor
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CHANGE: Confirmation & Submit */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that this is my own work and I have not plagiarized or copied from others.
                  I understand that submitting someone else's work is a violation of academic integrity policies.
                </label>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || files.length === 0 || !agreeToTerms}
                className="w-full gap-2"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CHANGE: Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course</span>
                <span className="font-medium">{assignment.course_title}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points</span>
                <span className="font-medium">{assignment.total_points} pts</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">
                  {new Date(assignment.due_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time Left</span>
                <Badge variant={daysLeft <= 3 ? 'destructive' : 'secondary'}>
                  {daysLeft} days
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Ensure all files are in the accepted formats
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Double-check your files before submitting
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Late submissions may incur penalties
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Include your name and student ID in the file
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}