import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructorAnalytics() {
  const navigate = useNavigate();

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
        <div>
          <h1 className="text-3xl font-bold">Course Analytics</h1>
          <p className="text-muted-foreground">Track student engagement and course performance</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-muted-foreground">
            Detailed analytics and reporting features coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}