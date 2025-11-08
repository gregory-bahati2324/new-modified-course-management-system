import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-subtle to-accent">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hero-gradient mx-auto">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="text-xl text-muted-foreground">
            Sorry, the page you're looking for doesn't exist.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/courses">Browse Courses</a>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact{' '}
          <a href="mailto:support@must.ac.tz" className="text-primary hover:underline">
            support@must.ac.tz
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
