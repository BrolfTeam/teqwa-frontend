import { memo, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { LoadingSpinner } from '@/components/ui';

const MainLayout = memo(({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        }>
          {children || <Outlet />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
export default MainLayout;