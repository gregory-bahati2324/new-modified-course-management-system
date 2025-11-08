import { useState } from 'react';
import { 
  Award, 
  Download, 
  Share, 
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function Certificates() {
  const [searchQuery, setSearchQuery] = useState('');

  const earnedCertificates = [
    {
      id: 1,
      title: "Database Systems Fundamentals",
      courseCode: "CS 301",
      instructor: "Dr. Emily Davis",
      completionDate: "November 15, 2024",
      grade: "A",
      credentialId: "MUST-CS301-2024-001234",
      skills: ["SQL", "Database Design", "Normalization", "Query Optimization"],
      verificationUrl: "https://verify.must.ac.tz/cert/001234",
      status: "issued"
    },
    {
      id: 2,
      title: "Introduction to Programming",
      courseCode: "CS 101",
      instructor: "Prof. James Wilson",
      completionDate: "September 22, 2024",
      grade: "B+",
      credentialId: "MUST-CS101-2024-005678",
      skills: ["Python", "Programming Logic", "Data Structures", "Algorithms"],
      verificationUrl: "https://verify.must.ac.tz/cert/005678",
      status: "issued"
    },
    {
      id: 3,
      title: "Web Development Basics",
      courseCode: "CS 201",
      instructor: "Dr. Sarah Johnson",
      completionDate: "October 8, 2024",
      grade: "A-",
      credentialId: "MUST-CS201-2024-009012",
      skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
      verificationUrl: "https://verify.must.ac.tz/cert/009012",
      status: "issued"
    }
  ];

  const inProgressCourses = [
    {
      id: 4,
      title: "Advanced Database Systems",
      courseCode: "CS 401",
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      estimatedCompletion: "December 20, 2024",
      currentGrade: "A-",
      requirementsCompleted: 8,
      totalRequirements: 10,
      status: "in_progress"
    },
    {
      id: 5,
      title: "Machine Learning Fundamentals",
      courseCode: "CS 451",
      instructor: "Prof. Michael Chen",
      progress: 60,
      estimatedCompletion: "January 15, 2025",
      currentGrade: "B+",
      requirementsCompleted: 6,
      totalRequirements: 12,
      status: "in_progress"
    },
    {
      id: 6,
      title: "Software Engineering Principles",
      courseCode: "CS 351",
      instructor: "Dr. Emily Davis",
      progress: 45,
      estimatedCompletion: "February 10, 2025",
      currentGrade: "A",
      requirementsCompleted: 4,
      totalRequirements: 8,
      status: "in_progress"
    }
  ];

  const availableCourses = [
    {
      id: 7,
      title: "Artificial Intelligence",
      courseCode: "CS 461",
      instructor: "Dr. Michael Thompson",
      duration: "16 weeks",
      prerequisites: ["Data Structures", "Algorithms", "Statistics"],
      skills: ["AI Algorithms", "Neural Networks", "Expert Systems"],
      enrollmentDeadline: "January 30, 2025",
      status: "available"
    },
    {
      id: 8,
      title: "Cybersecurity Fundamentals",
      courseCode: "CS 471",
      instructor: "Prof. Lisa Anderson",
      duration: "12 weeks",
      prerequisites: ["Network Security", "Operating Systems"],
      skills: ["Ethical Hacking", "Risk Assessment", "Security Protocols"],
      enrollmentDeadline: "February 15, 2025",
      status: "available"
    }
  ];

  const filteredEarned = earnedCertificates.filter(cert =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInProgress = inProgressCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Certificates & Achievements</h1>
          <p className="text-muted-foreground">
            Track your learning progress and showcase your achievements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Public Portfolio
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{earnedCertificates.length}</p>
                <p className="text-sm text-muted-foreground">Certificates Earned</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Skills Acquired</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">3.7</p>
                <p className="text-sm text-muted-foreground">Average GPA</p>
              </div>
              <Badge variant="secondary" className="text-lg">A-</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search certificates and courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Certificates Tabs */}
      <Tabs defaultValue="earned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">Earned Certificates</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          <div className="grid gap-6">
            {filteredEarned.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-academic transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-success" />
                        {certificate.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{certificate.courseCode}</span>
                        <span>•</span>
                        <span>Instructor: {certificate.instructor}</span>
                        <span>•</span>
                        <span>Grade: {certificate.grade}</span>
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Completion Date</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{certificate.completionDate}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Credential ID</p>
                      <p className="text-muted-foreground font-mono text-xs">{certificate.credentialId}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Skills Demonstrated</p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-6">
            {filteredInProgress.map((course) => (
              <Card key={course.id} className="hover:shadow-academic transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-warning" />
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.courseCode}</span>
                        <span>•</span>
                        <span>Instructor: {course.instructor}</span>
                        <span>•</span>
                        <span>Current Grade: {course.currentGrade}</span>
                      </div>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Course Progress</span>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Requirements Completed</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span>{course.requirementsCompleted} of {course.totalRequirements}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Estimated Completion</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{course.estimatedCompletion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Continue Course
                    </Button>
                    <Button size="sm" variant="outline">
                      View Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-6">
            {filteredAvailable.map((course) => (
              <Card key={course.id} className="hover:shadow-academic transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle>{course.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.courseCode}</span>
                        <span>•</span>
                        <span>Instructor: {course.instructor}</span>
                        <span>•</span>
                        <span>Duration: {course.duration}</span>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Prerequisites</p>
                    <div className="flex flex-wrap gap-2">
                      {course.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Skills You'll Learn</p>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Enrollment Deadline: {course.enrollmentDeadline}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button size="sm">
                      Enroll Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Course Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}