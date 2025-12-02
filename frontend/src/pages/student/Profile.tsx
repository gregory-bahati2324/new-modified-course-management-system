import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    studentId: "MUST/CS/2024/001",
    email: "john.doe@must.ac.tz",
    phone: "+255 123 456 789",
    program: "Computer Science",
    level: "Level 3",
    year: "2024/2025",
    address: "Dar es Salaam, Tanzania",
    enrollmentDate: "September 2022"
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-muted-foreground">{profile.studentId}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{profile.program}</Badge>
                  <Badge variant="outline">{profile.level}</Badge>
                </div>
                <div className="w-full pt-4 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Enrolled: {profile.enrollmentDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Academic Year: {profile.year}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={profile.studentId}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    value={profile.program}
                    disabled
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="text-lg font-semibold">{profile.level}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Academic Year</p>
                  <p className="text-lg font-semibold">{profile.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Enrollment Date</p>
                  <p className="text-lg font-semibold">{profile.enrollmentDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}