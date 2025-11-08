import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* University Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-hero-gradient">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">MUST</span>
                <span className="text-xs text-muted-foreground">Learning Hub</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Mbeya University of Science and Technology - Empowering minds through innovative education and cutting-edge research.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Learning</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Degree Programs
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Certificates
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Learning Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  User Guides
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-muted-foreground hover:text-foreground transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Mbeya, Tanzania</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+255 25 250 3368</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@must.ac.tz</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 Mbeya University of Science and Technology</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/accessibility" className="hover:text-foreground transition-colors">
              Accessibility
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Built with ❤️ for academic excellence
          </div>
        </div>
      </div>
    </footer>
  );
}