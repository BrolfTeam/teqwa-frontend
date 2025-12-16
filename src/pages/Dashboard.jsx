import { memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';
import UserDashboard from '@/components/dashboard/UserDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import ParentDashboard from '@/components/dashboard/ParentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import IslamicPattern from '@/components/ui/IslamicPattern';

const Dashboard = memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // Common wrapper for layouts
  const DashboardWrapper = ({ children }) => (
    <div className="relative min-h-screen bg-background/50">
      {/* Background Pattern */}
      <IslamicPattern color="currentColor" className="text-primary/5 fixed top-0 left-0 w-full h-full z-[-1]" opacity={0.03} />
      <div className="container px-4 py-8 mx-auto">
        {children}
      </div>
    </div>
  );

  if (user?.role === 'admin') {
    return (
      <DashboardWrapper>
        <AdminDashboard />
      </DashboardWrapper>
    );
  }

  // Check if user is a teacher (either role is 'teacher' or staff_profile role is 'teacher')
  const isTeacher = user?.role === 'teacher' || 
    (user?.role === 'staff' && user?.staff_profile?.role === 'teacher');
  
  if (isTeacher) {
    return (
      <DashboardWrapper>
        <TeacherDashboard />
      </DashboardWrapper>
    );
  }

  if (user?.role === 'staff') {
    return (
      <DashboardWrapper>
        <StaffDashboard />
      </DashboardWrapper>
    );
  }

  if (user?.role === 'student') {
    return (
      <DashboardWrapper>
        <StudentDashboard />
      </DashboardWrapper>
    );
  }

  if (user?.role === 'parent') {
    return (
      <DashboardWrapper>
        <ParentDashboard />
      </DashboardWrapper>
    );
  }

  // Default to User Dashboard (member, visitor, etc.)
  return (
    <DashboardWrapper>
      <UserDashboard />
    </DashboardWrapper>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;