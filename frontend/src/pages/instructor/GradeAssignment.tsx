import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Download, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function GradeAssignment() {
  const navigate = useNavigate();
  const { id, assignmentId, submissionId } = useParams();
  
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: '',
    rubricGrades: {
      'content': '',
      'organization': '',
      'technical': '',
      'presentation': ''
    }
  });

  const assignment = {
    id: 1,
    title: "Database Design Project",
    type: "project",
    totalPoints: 100,
    dueDate: "2024-12-20",
    rubric: [
      { id: 'content', name: 'Content Quality', points: 40 },
      { id: 'organization', name: 'Organization', points: 20 },
      { id: 'technical', name: 'Technical Implementation', points: 30 },
      { id: 'presentation', name: 'Presentation', points: 10 }
    ]
  };

  const submission = {
    id: 1,
    student: "John Smith",
    studentId: "STU001",
    submittedAt: "2024-12-15 14:30",
    status: "pending",
    attempts: 1,
    files: [
      { name: "database_design.pdf", size: "2.4 MB", type: "pdf" },
      { name: "implementation.sql", size: "856 KB", type: "sql" },
      { name: "documentation.docx", size: "1.2 MB", type: "docx" }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Grade data:', gradeData);
    navigate(`/instructor/course/${id}/assignment/${assignmentId}/view`);
  };

  const calculateTotalScore = () => {
    const rubricTotal = Object.values(gradeData.rubricGrades).reduce((sum, score) => {
      return sum + (parseFloat(score as string) || 0);
    }, 0);
    return gradeData.score ? parseFloat(gradeData.score) : rubricTotal;
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/instructor/course/${id}/assignment/${assignmentId}/view`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Grade Submission</h1>
          <p className="text-muted-foreground">{assignment.title} - {submission.student}</p>
        </div>
        <Badge variant="outline">{submission.status}</Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Student:</span>
                    <span className="ml-2 font-medium">{submission.student}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Student ID:</span>
                    <span className="ml-2">{submission.studentId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="ml-2">{submission.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Attempt:</span>
                    <span className="ml-2">{submission.attempts}/1</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Submitted Files</h4>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grading Rubric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.rubric.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={criterion.id}>{criterion.name}</Label>
                      <span className="text-sm text-muted-foreground">/{criterion.points} points</span>
                    </div>
                    <Input
                      id={criterion.id}
                      type="number"
                      max={criterion.points}
                      min="0"
                      step="0.5"
                      placeholder={`0 - ${criterion.points}`}
                      value={gradeData.rubricGrades[criterion.id as keyof typeof gradeData.rubricGrades]}
                      onChange={(e) => setGradeData({
                        ...gradeData,
                        rubricGrades: {
                          ...gradeData.rubricGrades,
                          [criterion.id]: e.target.value
                        }
                      })}
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Score:</span>
                    <span>{calculateTotalScore()}/{assignment.totalPoints}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="feedback">Written Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide detailed feedback for the student..."
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{calculateTotalScore()}</div>
                  <div className="text-muted-foreground">out of {assignment.totalPoints} points</div>
                  <div className="text-lg font-medium mt-2">
                    {Math.round((calculateTotalScore() / assignment.totalPoints) * 100)}%
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {assignment.rubric.map((criterion) => (
                    <div key={criterion.id} className="flex justify-between">
                      <span className="text-muted-foreground">{criterion.name}:</span>
                      <span>
                        {gradeData.rubricGrades[criterion.id as keyof typeof gradeData.rubricGrades] || 0}/{criterion.points}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Grade & Feedback
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Save as Draft
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Student
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download All Files
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}