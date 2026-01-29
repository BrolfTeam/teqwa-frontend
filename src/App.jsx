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

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Events = lazy(() => import('@/pages/Events'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const PrayerTimes = lazy(() => import('@/pages/PrayerTimes'));
const Contact = lazy(() => import('@/pages/Contact'));
const News = lazy(() => import('@/pages/News'));
const NewsDetail = lazy(() => import('@/pages/NewsDetail'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const Education = lazy(() => import('@/pages/Education'));
const Donations = lazy(() => import('@/pages/Donations'));
const Futsal = lazy(() => import('@/pages/Futsal'));
const Membership = lazy(() => import('@/pages/Membership'));
const Itikaf = lazy(() => import('@/pages/Itikaf'));
const Ders = lazy(() => import('@/pages/Ders'));
const Qibla = lazy(() => import('@/pages/Qibla'));
const IslamicCalendar = lazy(() => import('@/pages/IslamicCalendar'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Auth pages
const RoleSelection = lazy(() => import('@/pages/auth/RoleSelection'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// Protected pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Services = lazy(() => import('@/pages/Services'));

// ... (keep existing code)

// Booking & Staff pages
const BookingList = lazy(() => import('@/pages/bookings/BookingList'));
const UserBookings = lazy(() => import('@/pages/bookings/UserBookings'));
const StaffList = lazy(() => import('@/pages/staff/StaffList'));
const Attendance = lazy(() => import('@/pages/staff/Attendance'));
const WorkingHours = lazy(() => import('@/pages/staff/WorkingHours'));
const StaffTasks = lazy(() => import('@/pages/staff/Tasks'));
const StaffReports = lazy(() => import('@/pages/staff/Reports'));

// Admin pages
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

// Student pages
const StudentTimetable = lazy(() => import('@/pages/student/StudentTimetable'));
const StudentSubmissions = lazy(() => import('@/pages/student/StudentSubmissions'));

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