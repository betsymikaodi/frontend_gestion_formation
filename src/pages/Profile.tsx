import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Update user data in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user?.id);
    
    if (userIndex !== -1) {
      const updatedUser = {
        ...users[userIndex],
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.newPassword && { password: formData.newPassword }),
      };
      
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user session
      const { password, ...userWithoutPassword } = updatedUser;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  const ProfileField = ({ 
    label, 
    value, 
    name, 
    type = "text",
    showPassword,
    onTogglePassword 
  }: {
    label: string;
    value: string;
    name: string;
    type?: string;
    showPassword?: boolean;
    onTogglePassword?: () => void;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {isEditing ? (
        <div className="relative">
          <Input
            id={name}
            name={name}
            type={type === "password" && showPassword ? "text" : type}
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
            className="glass border-border/30"
          />
          {type === "password" && onTogglePassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={onTogglePassword}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      ) : (
        <div className="p-3 glass rounded-lg bg-muted/20">
          <p className="text-foreground">
            {type === "password" ? "••••••••" : value}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('profile')}
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gradient-primary text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} className="gradient-primary text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {t('save')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 gradient-primary rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-xl text-foreground">
                {user?.firstName} {user?.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge
                    variant={user?.role === 'admin' ? 'default' : 'secondary'}
                    className={cn(
                      'flex items-center gap-1',
                      user?.role === 'admin' ? 'bg-primary text-primary-foreground' : ''
                    )}
                  >
                    <Shield className="w-3 h-3" />
                    {user?.role === 'admin' ? t('admin') : t('user')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label={t('firstName')}
                  value={formData.firstName}
                  name="firstName"
                />
                
                <ProfileField
                  label={t('lastName')}
                  value={formData.lastName}
                  name="lastName"
                />
                
                <div className="md:col-span-2">
                  <ProfileField
                    label={t('email')}
                    value={formData.email}
                    name="email"
                    type="email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Password Section */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Leave password fields empty if you don't want to change your password
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProfileField
                  label="Current Password"
                  value={formData.currentPassword}
                  name="currentPassword"
                  type="password"
                  showPassword={showCurrentPassword}
                  onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                />
                
                <ProfileField
                  label="New Password"
                  value={formData.newPassword}
                  name="newPassword"
                  type="password"
                  showPassword={showNewPassword}
                  onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                />
                
                <ProfileField
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  name="confirmPassword"
                  type="password"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>
              Overview of your recent activity
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 glass rounded-xl">
                <div className="text-2xl font-bold text-primary mb-1">0</div>
                <div className="text-sm text-muted-foreground">Login Sessions</div>
              </div>
              
              <div className="text-center p-4 glass rounded-xl">
                <div className="text-2xl font-bold text-success mb-1">
                  {user?.role === 'admin' ? 'All' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Accessible Students</div>
              </div>
              
              <div className="text-center p-4 glass rounded-xl">
                <div className="text-2xl font-bold text-warning mb-1">0</div>
                <div className="text-sm text-muted-foreground">Recent Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;