import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Globe, ChevronRight, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import heroImage from '@/assets/hero-image.jpg';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="MUST Campus"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        </div>
        
        <div className="relative container py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  Welcome to MUST Learning Hub
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Empowering Minds Through
                  <span className="text-white/90 block mt-2">
                    Excellence in Education
                  </span>
                </h1>
                <p className="text-xl text-white/90 max-w-lg leading-relaxed">
                  Join Mbeya University of Science and Technology's innovative learning platform. 
                  Access world-class courses, connect with expert instructors, and earn 
                  internationally recognized certificates.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" className="group" asChild>
                  <Link to="/auth/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                  <Link to="/courses">
                    <Play className="mr-2 h-4 w-4" />
                    Explore Courses
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-white/80">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15,000+</div>
                  <div className="text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-300">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Quick Access</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Button variant="outline" className="h-16 bg-white/10 border-white/30 text-white hover:bg-white/20 flex-col" asChild>
                    <Link to="/auth/login?role=student">
                      <Users className="h-6 w-6 mb-2" />
                      Student Login
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-16 bg-white/10 border-white/30 text-white hover:bg-white/20 flex-col" asChild>
                    <Link to="/auth/login?role=instructor">
                      <BookOpen className="h-6 w-6 mb-2" />
                      Instructor Login
                    </Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Search courses..."
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  />
                  <Button className="w-full bg-white text-primary hover:bg-white/90">
                    Search Courses
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose MUST Learning Hub?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of education with our comprehensive learning management system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center group hover:shadow-academic transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary-subtle rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen className="h-8 w-8" />
                </div>
                <CardTitle>Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Engage with multimedia content, virtual labs, and interactive assignments designed for maximum learning retention.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-academic transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-success-subtle rounded-full flex items-center justify-center group-hover:bg-success group-hover:text-white transition-colors">
                  <Award className="h-8 w-8" />
                </div>
                <CardTitle>Certified Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn internationally recognized certificates and digital badges that showcase your achievements to employers worldwide.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-academic transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-warning-subtle rounded-full flex items-center justify-center group-hover:bg-warning group-hover:text-white transition-colors">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn from industry professionals and renowned academics who bring real-world experience to every course.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-academic transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Globe className="h-8 w-8" />
                </div>
                <CardTitle>Global Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access your courses anytime, anywhere with our mobile-friendly platform supporting English and Kiswahili.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="py-20 bg-card-subtle">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
              <p className="text-xl text-muted-foreground">
                Discover our most sought-after courses across various disciplines
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/courses">
                View All Courses
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Advanced Computer Science",
                instructor: "Dr. Sarah Johnson",
                students: 1240,
                rating: 4.9,
                level: "Advanced",
                duration: "12 weeks",
                category: "Technology"
              },
              {
                title: "Sustainable Engineering",
                instructor: "Prof. Michael Chen",
                students: 856,
                rating: 4.8,
                level: "Intermediate",
                duration: "10 weeks",
                category: "Engineering"
              },
              {
                title: "Digital Marketing Strategy",
                instructor: "Dr. Emily Davis",
                students: 2100,
                rating: 4.7,
                level: "Beginner",
                duration: "8 weeks",
                category: "Business"
              }
            ].map((course, index) => (
              <Card key={index} className="group hover:shadow-academic transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{course.category}</Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription>
                    by {course.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{course.students} students</span>
                    <span>{course.duration}</span>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                  <Button className="w-full" asChild>
                    <Link to={`/courses/${index + 1}`}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of students already learning with MUST. Create your account today and 
              unlock access to our comprehensive course library.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth/register">
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link to="/contact">
                  Contact Admissions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}