import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@must.ac.tz',
    phone: '+255 123 456 789',
    location: 'Dar es Salaam, Tanzania',
    bio: 'Passionate learner pursuing excellence in Computer Science.',
    joinDate: 'January 2024',
    avatar: '',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleAvatarChange = () => {
    toast.info('Avatar upload functionality coming soon');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button
                  variant="outline"
                  disabled={!isEditing}
                  onClick={handleAvatarChange}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {profile.joinDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>Your learning progress overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Courses Enrolled</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">85%</div>
                  <div className="text-sm text-muted-foreground">Average Progress</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">48</div>
                  <div className="text-sm text-muted-foreground">Hours Learned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}