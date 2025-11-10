import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Download, AlertCircle, CheckCircle2, Users, BookOpen, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BulkImport() {
  const { toast } = useToast();
  const [importType, setImportType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    total: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or XLSX file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !importType) {
      toast({
        title: "Missing Information",
        description: "Please select import type and file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate processing
    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(100);
      
      // Mock result
      const mockResult = {
        success: 45,
        failed: 5,
        total: 50,
        errors: [
          'Row 12: Invalid email format',
          'Row 23: Missing required field "name"',
          'Row 34: Duplicate entry',
          'Row 41: Invalid date format',
          'Row 48: Role not found'
        ]
      };
      
      setUploadResult(mockResult);
      
      toast({
        title: "Import Completed",
        description: `Successfully imported ${mockResult.success} out of ${mockResult.total} records.`,
      });
    }, 2500);
  };

  const downloadTemplate = (type: string) => {
    toast({
      title: "Template Downloaded",
      description: `${type} template has been downloaded.`,
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Bulk Import</h1>
          <p className="text-muted-foreground mt-2">
            Import multiple records at once using CSV or Excel files
          </p>
        </div>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList>
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="templates">Download Templates</TabsTrigger>
            <TabsTrigger value="guide">Import Guide</TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            {/* Import Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Import Type</CardTitle>
                <CardDescription>
                  Choose what type of data you want to import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="importType">Data Type *</Label>
                  <Select onValueChange={setImportType} value={importType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select import type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="users">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Users (Students & Instructors)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="courses">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Courses</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="enrollments">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Course Enrollments</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>
                  Upload a CSV or Excel file containing your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-sm font-medium">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        CSV or XLSX files (Max 5MB)
                      </div>
                    </Label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {file && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-muted-foreground">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Uploading and processing... {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={!file || !importType || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Processing..." : "Start Import"}
                </Button>
              </CardContent>
            </Card>

            {/* Upload Results */}
            {uploadResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Results</CardTitle>
                  <CardDescription>Summary of the import operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{uploadResult.total}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {uploadResult.success}
                      </div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {uploadResult.failed}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Errors Found</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1">
                          {uploadResult.errors.map((error, index) => (
                            <div key={index} className="text-xs">• {error}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResult.success > 0 && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Import Successful</AlertTitle>
                      <AlertDescription>
                        {uploadResult.success} records have been successfully imported and are now active in the system.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Download Templates</CardTitle>
                <CardDescription>
                  Download template files with correct format and sample data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <Users className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Users Template</CardTitle>
                      <CardDescription className="text-xs">
                        Import students and instructors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => downloadTemplate('Users')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <BookOpen className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Courses Template</CardTitle>
                      <CardDescription className="text-xs">
                        Import course information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => downloadTemplate('Courses')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Enrollments Template</CardTitle>
                      <CardDescription className="text-xs">
                        Bulk enroll students in courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => downloadTemplate('Enrollments')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide">
            <Card>
              <CardHeader>
                <CardTitle>Import Guide</CardTitle>
                <CardDescription>
                  Best practices and guidelines for bulk imports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Before You Import:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Download and use the provided template files</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Ensure all required fields are filled correctly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Verify email addresses are in correct format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Check for duplicate entries before uploading</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Keep file size under 5MB for optimal performance</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">Common Errors to Avoid:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Missing required fields (marked with *)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Invalid email format or phone numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Incorrect date formats (use YYYY-MM-DD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Using roles or categories that don't exist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Special characters in ID fields</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}