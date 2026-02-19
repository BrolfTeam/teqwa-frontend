import { lazy, Suspense, memo, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { LoadingSpinner } from '@/components/ui';
import { lazyRetry } from '@/utils/lazyRetry';

// Lazy load pages for better performance
const Home = lazy(() => lazyRetry(() => import('@/pages/Home')));
const About = lazy(() => lazyRetry(() => import('@/pages/About')));
const Events = lazy(() => lazyRetry(() => import('@/pages/Events')));
const Gallery = lazy(() => lazyRetry(() => import('@/pages/Gallery')));
const PrayerTimes = lazy(() => lazyRetry(() => import('@/pages/PrayerTimes')));
const Contact = lazy(() => lazyRetry(() => import('@/pages/Contact')));
const News = lazy(() => lazyRetry(() => import('@/pages/News')));
const NewsDetail = lazy(() => lazyRetry(() => import('@/pages/NewsDetail')));
const EventDetail = lazy(() => lazyRetry(() => import('@/pages/EventDetail')));
const Education = lazy(() => lazyRetry(() => import('@/pages/Education')));
const Donations = lazy(() => lazyRetry(() => import('@/pages/Donations')));
const Futsal = lazy(() => lazyRetry(() => import('@/pages/Futsal')));
const Membership = lazy(() => lazyRetry(() => import('@/pages/Membership')));
const Itikaf = lazy(() => lazyRetry(() => import('@/pages/Itikaf')));
const Ders = lazy(() => lazyRetry(() => import('@/pages/Ders')));
const Qibla = lazy(() => lazyRetry(() => import('@/pages/Qibla')));
const IslamicCalendar = lazy(() => lazyRetry(() => import('@/pages/IslamicCalendar')));
const PaymentSuccess = lazy(() => lazyRetry(() => import('@/pages/PaymentSuccess')));
const NotFound = lazy(() => lazyRetry(() => import('@/pages/NotFound')));

// Auth pages
const RoleSelection = lazy(() => lazyRetry(() => import('@/pages/auth/RoleSelection')));
const Login = lazy(() => lazyRetry(() => import('@/pages/auth/Login')));
const Register = lazy(() => lazyRetry(() => import('@/pages/auth/Register')));
const ForgotPassword = lazy(() => lazyRetry(() => import('@/pages/auth/ForgotPassword')));
const ResetPassword = lazy(() => lazyRetry(() => import('@/pages/auth/ResetPassword')));

// Protected pages
const Dashboard = lazy(() => lazyRetry(() => import('@/pages/Dashboard')));
const Profile = lazy(() => lazyRetry(() => import('@/pages/Profile')));
const Services = lazy(() => lazyRetry(() => import('@/pages/Services')));

// Booking & Staff pages
const BookingList = lazy(() => lazyRetry(() => import('@/pages/bookings/BookingList')));
const UserBookings = lazy(() => lazyRetry(() => import('@/pages/bookings/UserBookings')));
const StaffList = lazy(() => lazyRetry(() => import('@/pages/staff/StaffList')));
const Attendance = lazy(() => lazyRetry(() => import('@/pages/staff/Attendance')));
const WorkingHours = lazy(() => lazyRetry(() => import('@/pages/staff/WorkingHours')));
const StaffTasks = lazy(() => lazyRetry(() => import('@/pages/staff/Tasks')));
const StaffReports = lazy(() => lazyRetry(() => import('@/pages/staff/Reports')));

// Admin pages
const UserManagement = lazy(() => lazyRetry(() => import('@/pages/admin/UserManagement')));
const AdminSettings = lazy(() => lazyRetry(() => import('@/pages/admin/Settings')));
const DonationManagement = lazy(() => lazyRetry(() => import('@/pages/admin/DonationManagement')));

// Student pages
const StudentTimetable = lazy(() => lazyRetry(() => import('@/pages/student/StudentTimetable')));
const StudentSubmissions = lazy(() => lazyRetry(() => import('@/pages/student/StudentSubmissions')));

const LoadingFallback = memo(() => (
  <div className="min-h-[60vh] flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
));
LoadingFallback.displayName = 'LoadingFallback';

const AppContent = memo(() => {
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="prayer-times" element={<PrayerTimes />} />
            <Route path="contact" element={<Contact />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="announcements/:id" element={<NewsDetail />} />
            <Route path="education" element={<Education />} />
            <Route path="donations" element={<Donations />} />
            <Route path="donate" element={<Donations />} />
            <Route path="donate" element={<Donations />} />
            <Route path="services" element={<Services />} />
            <Route path="futsal" element={<Futsal />} />
            <Route path="membership" element={<Membership />} />
            <Route path="itikaf" element={<Itikaf />} />
            <Route path="ders" element={<Ders />} />

            <Route path="qibla" element={<Qibla />} />
            <Route path="islamic-calendar" element={<IslamicCalendar />} />
            <Route path="payment/success/:txRef" element={<PaymentSuccess />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/role-selection" element={
            <ProtectedRoute requireAuth={false}>
              <RoleSelection />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <AuthLayout><ForgotPassword /></AuthLayout>
            </ProtectedRoute>
          } />
          <Route path="/reset-password/:token" element={
            <ProtectedRoute requireAuth={false}>
              <AuthLayout><ResetPassword /></AuthLayout>
            </ProtectedRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout><Profile /></MainLayout>
            </ProtectedRoute>
          } />

          {/* Module Routes */}
          <Route path="/bookings" element={
            <ProtectedRoute>
              <DashboardLayout><BookingList /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/bookings/user" element={
            <ProtectedRoute>
              <DashboardLayout><UserBookings /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff" element={
            <ProtectedRoute>
              <DashboardLayout><StaffList /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/staff/attendance" element={
            <ProtectedRoute>
              <DashboardLayout><Attendance /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/staff/hours" element={
            <ProtectedRoute>
              <DashboardLayout><WorkingHours /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/staff/tasks" element={
            <ProtectedRoute>
              <DashboardLayout><StaffTasks /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/staff/reports" element={
            <ProtectedRoute>
              <DashboardLayout><StaffReports /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <DashboardLayout><UserManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <DashboardLayout><AdminSettings /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/donations" element={
            <ProtectedRoute>
              <DashboardLayout><DonationManagement /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/timetable" element={
            <ProtectedRoute>
              <MainLayout><StudentTimetable /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/submissions" element={
            <ProtectedRoute>
              <MainLayout><StudentSubmissions /></MainLayout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          className: 'font-sans',
          duration: 5000,
        }}
      />
    </div>
  );
});
AppContent.displayName = 'AppContent';

const App = memo(() => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
});

App.displayName = 'App';
export default App;