import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';
import { FiUser, FiMail, FiPhone, FiEdit, FiSave, FiX, FiCalendar, FiHeart, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Profile = memo(() => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        // Fetch profile and stats in parallel
        const [profileResponse, statsResponse] = await Promise.all([
          apiService.get('/accounts/profile/'),
          apiService.get('/accounts/dashboard-stats/')
        ]);

        const profile = profileResponse.data;
        // Construct full name
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;

        setFormData({
          name: fullName,
          email: profile.email || '',
          phone: profile.phone || '',
          bio: profile.profile?.bio || '',
        });

        // Update auth context with latest user data if needed, 
        // though usually context manages its own user state.
        // We might want to keep them in sync.

        setStatsData(statsResponse.data);
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);

    try {
      // Split name into first and last
      const nameParts = formData.name.trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ');

      const updateData = {
        first_name,
        last_name,
        phone: formData.phone,
        profile: {
          bio: formData.bio
        }
      };

      const response = await apiService.put('/accounts/profile/update/', updateData);

      // Update local form data with response to ensure sync
      const updatedProfile = response.data;
      const updatedFullName = [updatedProfile.first_name, updatedProfile.last_name].filter(Boolean).join(' ');

      setFormData(prev => ({
        ...prev,
        name: updatedFullName,
        phone: updatedProfile.phone || '',
        bio: updatedProfile.profile?.bio || ''
      }));

      // Update auth context user
      // Note: We need to make sure the structure matches what auth context expects
      login({ ...user, ...updatedProfile });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to latest fetched data (which we should probably store separately if we want true reset)
    // For now, re-fetching or just keeping current state (if we didn't mutate it directly) is fine,
    // but better to reset to "initial" values specific to this edit session.
    // Simpler approach: Just re-trigger the effect or store 'originalData'.
    // Let's implement 'originalData' for robustness.
  };

  // Use a ref or state to store original data for cancel
  const [originalData, setOriginalData] = useState(null);

  // Update originalData when fetch completes
  useEffect(() => {
    if (!isLoading && !isEditing) {
      setOriginalData(formData);
    }
  }, [isLoading, isEditing]); // Update when editing finishes or loads

  const handleCancelClick = () => {
    setFormData(originalData);
    setIsEditing(false);
  }


  const stats = [
    {
      label: 'Upcoming Events',
      value: statsData?.counts?.upcoming_events || '0',
      icon: <FiCalendar className="h-5 w-5" />
    },
    {
      label: 'Donations Made',
      value: statsData?.donation_stats?.total_amount ? `${statsData.donation_stats.total_amount} ETB` : '0 ETB',
      icon: <FiHeart className="h-5 w-5" />
    },
    {
      label: 'Community Points',
      value: statsData?.points || '0',
      icon: <FiUsers className="h-5 w-5" />
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FiUser className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <FiEdit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelClick}
                        disabled={isSaving}
                      >
                        <FiX className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <FiSave className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                          <FiUser className="h-4 w-4 text-muted-foreground" />
                          <span>{formData.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled={true}
                            className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                            title="Email cannot be changed directly"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>

                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                          <FiMail className="h-4 w-4 text-muted-foreground" />
                          <span>{formData.email || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                          <FiPhone className="h-4 w-4 text-muted-foreground" />
                          <span>{formData.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Member Since</label>
                      <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                        <FiCalendar className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <div className="p-3 bg-accent/10 rounded-lg min-h-[100px]">
                        <p className="text-muted-foreground">
                          {formData.bio || 'No bio provided yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats and Quick Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {stat.icon}
                        </div>
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href="/bookings/user">
                      <FiCalendar className="h-4 w-4 mr-2" />
                      My Bookings
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href="/donate">
                      <FiHeart className="h-4 w-4 mr-2" />
                      Make Donation
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href="/events">
                      <FiUsers className="h-4 w-4 mr-2" />
                      Browse Events
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';
export default Profile;