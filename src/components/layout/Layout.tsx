import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return t('dashboard');
      case '/students':
        return t('students');
      case '/courses':
        return 'Formations';
      case '/enrollments':
        return t('enrollments');
      case '/reports':
        return t('reports');
      case '/profile':
        return t('profile');
      default:
        return t('dashboard');
    }
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.4,
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Top Bar Container */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background">
        <div className="flex w-full">
          {/* Sidebar - At Header Level */}
          <div className="hidden lg:block w-56">
            <Sidebar isOpen={true} onClose={() => { }} />
          </div>

          {/* Header */}
          <div className="flex-1 border-b w-full lg:w-auto">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              title={getPageTitle()}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar Space */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          {/* This is just a spacer */}
        </div>

        {/* Page Content - Scrollable */}
        <main className="flex-1 w-full overflow-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;