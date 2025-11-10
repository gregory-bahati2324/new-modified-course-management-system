import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Users, BookOpen, Calendar, BarChart3, FileSpreadsheet, FileType } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ExportData() {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<string>('');
  const [fileFormat, setFileFormat] = useState<string>('csv');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const dataTypes = [
    { value: 'users', label: 'Users', icon: Users, description: 'Export all user data' },
    { value: 'courses', label: 'Courses', icon: BookOpen, description: 'Export course information' },
    { value: 'enrollments', label: 'Enrollments', icon: FileSpreadsheet, description: 'Export enrollment data' },
    { value: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Export platform analytics' },
  ];

  const fieldsByType: Record<string, string[]> = {
    users: ['Name', 'Email', 'Role', 'Registration Date', 'Last Login', 'Status', 'Program'],
    courses: ['Course Code', 'Title', 'Instructor', 'Category', 'Students', 'Status', 'Start Date', 'End Date'],
    enrollments: ['Student Name', 'Course Name', 'Enrollment Date', 'Progress', 'Grade', 'Status'],
    analytics: ['Date', 'Active Users', 'New Registrations', 'Course Completions', 'Page Views'],
  };

  const handleExport = async () => {
    if (!exportType) {
      toast({
        title: "Missing Information",
        description: "Please select data type to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Successful",
        description: `${exportType} data has been exported as ${fileFormat.toUpperCase()}.`,
      });
    }, 2000);
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const selectAllFields = () => {
    if (exportType && fieldsByType[exportType]) {
      setSelectedFields(fieldsByType[exportType]);
    }
  };

  const clearAllFields = () => {
    setSelectedFields([]);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Export Data</h1>
          <p className="text-muted-foreground mt-2">
            Download platform data in various formats for analysis or backup
          </p>
        </div>

        <div className="space-y-6">
          {/* Data Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Data Type</CardTitle>
              <CardDescription>
                Choose what type of data you want to export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setExportType(type.value);
                      setSelectedFields([]);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      exportType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <type.icon className={`h-8 w-8 mb-2 ${
                      exportType === type.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          {exportType && fieldsByType[exportType] && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Fields</CardTitle>
                    <CardDescription>
                      Choose which fields to include in the export
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllFields}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFields}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fieldsByType[exportType].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <Label
                        htmlFor={field}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Configure export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">File Format</Label>
                <Select value={fileFormat} onValueChange={setFileFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>CSV (Comma Separated)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Excel (.xlsx)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4" />
                        <span>JSON</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          {exportType && (
            <Card>
              <CardHeader>
                <CardTitle>Export Summary</CardTitle>
                <CardDescription>
                  Review your export configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Type:</span>
                  <span className="font-medium capitalize">{exportType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{fileFormat.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fields Selected:</span>
                  <span className="font-medium">
                    {selectedFields.length > 0 ? selectedFields.length : 'All'}
                  </span>
                </div>
                {dateRange.start && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date Range:</span>
                    <span className="font-medium">
                      {dateRange.start} {dateRange.end && `to ${dateRange.end}`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={!exportType || isExporting}
            className="w-full"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}