import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Memoized Navigation Component with deep comparison
const Navigation = React.memo(({ isAuthenticated, user, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-primary-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-accent-600">
                Roadmap App
              </h1>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-primary-700 hover:text-accent-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Roadmap
              </Link>
              {isAuthenticated ? (
                <>
                  <span className="text-primary-600 px-3 py-2 text-sm">
                    Welcome, {user?.username}
                  </span>
                  <button
                    onClick={onLogout}
                    className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-primary-700 hover:text-accent-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-primary-700 hover:text-accent-600 focus:outline-none focus:text-accent-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.isAuthenticated === nextProps.isAuthenticated &&
    prevProps.user?.username === nextProps.user?.username &&
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.onLogout === nextProps.onLogout
  );
});

Navigation.displayName = 'Navigation';

// Memoized Footer Component - Normal footer that scrolls with content
const Footer = React.memo(() => {
  return (
    <footer className="bg-white border-t border-primary-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-primary-600 text-sm">
          <p>&copy; 2025 Copyright reserved Md Mehedi Hasan</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  // Stabilize navigation props
  const navigationProps = useMemo(() => ({
    isAuthenticated,
    user,
    onLogout: handleLogout
  }), [isAuthenticated, user, handleLogout]);

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      {/* Fixed Navigation Header */}
      <Navigation {...navigationProps} />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Normal Footer */}
      <Footer />
    </div>
  );
};

export default Layout; 