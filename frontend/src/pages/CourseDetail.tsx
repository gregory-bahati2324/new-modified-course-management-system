import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  Download,
  Play,
  CheckCircle,
  FileText,
  MessageSquare,
  Share,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function CourseDetail() {
  const { id: courseId } = useParams();
  const [enrolled, setEnrolled] = useState(false);

  const course = {
    title: "Advanced Database Systems",
    code: "CS 401",
    instructor: "Dr. Sarah Johnson",
    department: "Computer Science & Engineering",
    duration: "16 weeks",
    level: "Advanced",
    credits: 4,
    language: "English",
    rating: 4.8,
    reviews: 156,
    enrolled: 186,
    maxCapacity: 200,
    startDate: "January 15, 2025",
    endDate: "May 15, 2025",
    description: "This course covers advanced topics in database systems including distributed databases, NoSQL systems, data warehousing, and modern database architectures.",
    prerequisites: ["Database Systems (CS 301)", "Data Structures (CS 201)"],
    objectives: [
      "Understand advanced database concepts and architectures",
      "Design and implement distributed database systems",
      "Work with NoSQL databases and modern data storage solutions",
      "Analyze and optimize database performance",
      "Apply database security and transaction management principles"
    ]
  };

  const syllabus = [
    {
      week: 1,
      title: "Introduction to Advanced Database Concepts",
      topics: ["Review of Database Fundamentals", "Advanced SQL", "Query Optimization"],
      materials: ["Lecture Slides", "Reading: Chapter 1-2", "Lab Exercise 1"],
      assignments: [],
      duration: "3 hours"
    },
    {
      week: 2,
      title: "Database Design and Normalization",
      topics: ["Advanced Normalization", "Denormalization Strategies", "Index Design"],
      materials: ["Lecture Slides", "Video: Index Performance", "Case Study"],
      assignments: ["Assignment 1: Database Design"],
      duration: "3 hours"
    },
    {
      week: 3,
      title: "Transaction Management",
      topics: ["ACID Properties", "Concurrency Control", "Deadlock Management"],
      materials: ["Lecture Slides", "Interactive Demo", "Reading: Chapter 15"],
      assignments: [],
      duration: "3 hours"
    },
    {
      week: 4,
      title: "Distributed Database Systems",
      topics: ["Distributed Architecture", "Data Fragmentation", "Replication"],
      materials: ["Lecture Slides", "Lab: Setting up MongoDB Cluster", "Research Paper"],
      assignments: ["Midterm Project Proposal"],
      duration: "3 hours"
    }
  ];

  const instructor = {
    name: "Dr. Sarah Johnson",
    title: "Senior Lecturer",
    department: "Computer Science & Engineering",
    experience: "12 years",
    rating: 4.9,
    bio: "Dr. Johnson has extensive experience in database systems research and has published over 30 papers in top-tier conferences. She has worked with major tech companies on large-scale database optimization projects.",
    avatar: undefined
  };

  const reviews = [
    {
      studentName: "John M.",
      rating: 5,
      comment: "Excellent course! Dr. Johnson explains complex concepts very clearly and the hands-on labs are very helpful.",
      date: "2 weeks ago"
    },
    {
      studentName: "Grace K.",
      rating: 4,
      comment: "Very comprehensive course. The workload is heavy but manageable. Great preparation for industry work.",
      date: "1 month ago"
    },
    {
      studentName: "Peter S.",
      rating: 5,
      comment: "Best database course I've taken. Real-world examples and practical assignments make learning engaging.",
      date: "1 month ago"
    }
  ];

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{course.department}</span>
                <span>•</span>
                <span>{course.code}</span>
              </div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{course.instructor}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{course.rating}</span>
                <span className="text-sm text-muted-foreground">({course.reviews} reviews)</span>
              </div>
              <Badge variant="secondary">{course.level}</Badge>
              <Badge variant="outline">{course.language}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{course.enrolled}/{course.maxCapacity} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{course.startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{course.credits} credits</span>
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <Card className="lg:w-96">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">Free</div>
                  <div className="text-sm text-muted-foreground">University Course</div>
                </div>

                <Progress value={(course.enrolled / course.maxCapacity) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  {course.maxCapacity - course.enrolled} spots remaining
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    if (enrolled) {
                      window.location.href = `/student/course/${courseId}/learn`;
                    } else {
                      setEnrolled(true);
                    }
                  }}
                  variant={enrolled ? "default" : "default"}
                >
                  {enrolled ? "Go to Course" : "Enroll Now"}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmark
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{course.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{course.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>Hybrid (Online + In-person)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.prerequisites.map((prereq, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Syllabus</CardTitle>
              <CardDescription>
                Weekly breakdown of topics, materials, and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {syllabus.map((week) => (
                  <AccordionItem key={week.week} value={`week-${week.week}`}>
                    <AccordionTrigger className="text-left">
                      <div className="space-y-1">
                        <div className="font-medium">Week {week.week}: {week.title}</div>
                        <div className="text-sm text-muted-foreground">{week.duration}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Topics Covered</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {week.topics.map((topic, index) => (
                            <li key={index}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Materials</h4>
                        <div className="space-y-1">
                          {week.materials.map((material, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{material}</span>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {week.assignments.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Assignments</h4>
                          <div className="space-y-1">
                            {week.assignments.map((assignment, index) => (
                              <Badge key={index} className="bg-warning text-warning-foreground mr-2">
                                {assignment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructor" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">SJ</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-semibold">{instructor.name}</h3>
                  <p className="text-muted-foreground">{instructor.title}</p>
                  <p className="text-sm text-muted-foreground">{instructor.department}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{instructor.experience} experience</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{instructor.rating} rating</span>
                    </div>
                  </div>
                  <p className="text-sm">{instructor.bio}</p>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Instructor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
              <CardDescription>
                {course.reviews} reviews • {course.rating} average rating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.map((review, index) => (
                <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{review.studentName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{review.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
              <CardDescription>
                Additional materials and references for the course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Course Handbook</p>
                      <p className="text-sm text-muted-foreground">Complete course guide and policies</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle">
                  <div className="flex items-center gap-3">
                    <Play className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Lecture Recordings</p>
                      <p className="text-sm text-muted-foreground">Access to all recorded sessions</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Watch
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card-subtle">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Recommended Textbook</p>
                      <p className="text-sm text-muted-foreground">Database Systems: The Complete Book</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}