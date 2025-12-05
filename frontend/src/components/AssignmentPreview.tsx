/**
 * CHANGES MADE TODAY (2025-12-05):
 * - Created AssignmentPreview component to preview assignments as students would see them
 * - Shows assignment details, instructions, and submission area
 */

import { X, Calendar, Clock, FileText, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface AssignmentData {
  title: string;
  type: string;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  points: string;
  attempts: string;
  timeLimit: string;
  module: string;
}

interface AssignmentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentData: AssignmentData;
}

export default function AssignmentPreview({ isOpen, onClose, assignmentData }: AssignmentPreviewProps) {
  if (!isOpen) return null;

  const formatDueDate = () => {
    if (!assignmentData.dueDate) return 'No due date set';
    const date = new Date(assignmentData.dueDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return assignmentData.dueTime 
      ? `${formattedDate} at ${assignmentData.dueTime}`
      : formattedDate;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge variant="secondary" className="mb-2 capitalize">{assignmentData.type || 'Assignment'}</Badge>
            <h1 className="text-2xl font-bold">{assignmentData.title || 'Untitled Assignment'}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {assignmentData.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {assignmentData.instructions ? (
                    <p className="whitespace-pre-wrap">{assignmentData.instructions}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No instructions provided.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submission Area */}
            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Written Response (Optional)</label>
                  <Textarea
                    placeholder="Write your response here..."
                    rows={6}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">File Upload</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <Input type="file" className="max-w-xs mx-auto" multiple />
                    <p className="text-xs text-muted-foreground mt-2">
                      Accepted file types: PDF, DOC, DOCX, TXT, ZIP
                    </p>
                  </div>
                </div>

                <Button className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Assignment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{formatDueDate()}</p>
                  </div>
                </div>

                {assignmentData.points && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Points</p>
                      <p className="text-sm text-muted-foreground">{assignmentData.points} points</p>
                    </div>
                  </div>
                )}

                {assignmentData.timeLimit && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time Limit</p>
                      <p className="text-sm text-muted-foreground">{assignmentData.timeLimit} minutes</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attempts Allowed:</span>
                    <span>{assignmentData.attempts === 'unlimited' ? 'Unlimited' : assignmentData.attempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">Not Started</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Status */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No submission yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={onClose}>Close Preview</Button>
        </div>
      </div>
    </div>
  );
}