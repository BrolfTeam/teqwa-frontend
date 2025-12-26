import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/lib/apiService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// New Modular Components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileQuickActions } from '@/components/profile/ProfileQuickActions';

const Profile = memo(() => {
  const { t } = useTranslation();
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
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const [profileResponse, statsResponse] = await Promise.all([
          apiService.get('/accounts/profile/'),
          apiService.get('/accounts/dashboard-stats/')
        ]);

        const profile = profileResponse.data;
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;

        const data = {
          name: fullName,
          email: profile.email || '',
          phone: profile.phone || '',
          bio: profile.profile?.bio || '',
        };

        setFormData(data);
        setOriginalData(data);
        setStatsData(statsResponse.data);
      } catch (error) {
        toast.error(t('profile.failedToLoad'));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t('profile.nameRequired'));
      return;
    }

    setIsSaving(true);
    try {
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
      const updatedProfile = response.data;
      const updatedFullName = [updatedProfile.first_name, updatedProfile.last_name].filter(Boolean).join(' ');

      const newData = {
        ...formData,
        name: updatedFullName,
        phone: updatedProfile.phone || '',
        bio: updatedProfile.profile?.bio || ''
      };

      setFormData(newData);
      setOriginalData(newData);
      login({ ...user, ...updatedProfile });
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      toast.error(t('profile.updateError'));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-bold animate-pulse">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <ProfileHeader user={user} />

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Info Section */}
          <div className="lg:col-span-8">
            <ProfileInfo
              formData={formData}
              isEditing={isEditing}
              isSaving={isSaving}
              handleChange={handleChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              setIsEditing={setIsEditing}
            />
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-8">
            <ProfileStats statsData={statsData} />
            <ProfileQuickActions />
          </div>
        </div>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';
export default Profile;