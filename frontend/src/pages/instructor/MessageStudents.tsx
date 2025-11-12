import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Users, Search, Filter, Plus, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

export default function MessageStudents() {
  const navigate = useNavigate();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const courses = [
    { id: 'cs401', name: 'Advanced Database Systems', students: 45 },
    { id: 'cs201', name: 'Data Structures & Algorithms', students: 67 },
    { id: 'cs451', name: 'Machine Learning Fundamentals', students: 38 }
  ];

  const students = [
    {
      id: '1',
      name: 'John Mwalimu',
      email: 'john.mwalimu@must.ac.tz',
      course: 'CS 401',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: undefined
    },
    {
      id: '2', 
      name: 'Grace Kikoti',
      email: 'grace.kikoti@must.ac.tz',
      course: 'CS 451',
      status: 'active',
      lastActive: '1 day ago',
      avatar: undefined
    },
    {
      id: '3',
      name: 'Peter Msigwa',
      email: 'peter.msigwa@must.ac.tz', 
      course: 'CS 201',
      status: 'active',
      lastActive: '3 hours ago',
      avatar: undefined
    },
    {
      id: '4',
      name: 'Fatuma Hassan',
      email: 'fatuma.hassan@must.ac.tz',
      course: 'CS 401', 
      status: 'inactive',
      lastActive: '1 week ago',
      avatar: undefined
    }
  ];

  const handleSelectStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSendMessage = () => {
    console.log('Sending message to:', selectedStudents, { subject, message });
    // Handle message sending logic
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/instructor')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Message Students</h1>
          <p className="text-muted-foreground">Send announcements and communicate with your students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
              <CardDescription>
                Choose students to send your message to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    className="w-full pl-10"
                  />
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-lg rounded-md z-50">
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox 
                  checked={selectedStudents.length === students.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">
                  Select All ({students.length} students)
                </span>
                {selectedStudents.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedStudents.length} selected
                  </Badge>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div 
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    <Checkbox 
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                    />
                    <Avatar>
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="text-right text-sm">
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.course}
                      </Badge>
                      <p className="text-muted-foreground mt-1">{student.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Composition */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Message subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message here..."
                  className="min-h-48"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach File
                </Button>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Recipients: {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleSendMessage}
                  disabled={selectedStudents.length === 0 || !subject || !message}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setSubject('Class Reminder');
                  setMessage('This is a reminder about our upcoming class session...');
                }}
              >
                Class Reminder
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setSubject('Assignment Due Soon');
                  setMessage('This is a reminder that your assignment is due soon...');
                }}
              >
                Assignment Reminder
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setSubject('Course Announcement');
                  setMessage('Important announcement regarding the course...');
                }}
              >
                Course Announcement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}