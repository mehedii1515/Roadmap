import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import RoadmapList from './components/RoadmapList';
import RoadmapDetail from './components/RoadmapDetail';
import Login from './components/Login';
import Register from './components/Register';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Public route component (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Home component that shows landing page for non-authenticated users and roadmap for authenticated users
const Home = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <RoadmapList />;
  }
  
  return <LandingPage />;
};

// Main content component that handles routing
const AppRoutes = React.memo(() => {
  const location = useLocation();
  
  // Determine if we need layout for current route
  const needsLayout = useMemo(() => {
    const noLayoutRoutes = ['/login', '/register'];
    // Don't use layout for landing page (when not authenticated)
    return !noLayoutRoutes.includes(location.pathname);
  }, [location.pathname]);

  const routeContent = useMemo(() => (
    <Routes>
      {/* Home route - shows landing page or roadmap based on authentication */}
      <Route path="/" element={<Home />} />
      
      {/* Public routes with potential layout */}
      <Route path="/roadmap" element={<RoadmapList />} />
      <Route path="/roadmap/:id" element={<RoadmapDetail />} />
      
      {/* Authentication routes without layout */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  ), []);

  // Check if current route is landing page and user is not authenticated
  const { isAuthenticated } = useAuth();
  const isLandingPage = location.pathname === '/' && !isAuthenticated;

  // Don't use layout for landing page
  if (!needsLayout || isLandingPage) {
    return routeContent;
  }

  return (
    <Layout>
      {routeContent}
    </Layout>
  );
});

AppRoutes.displayName = 'AppRoutes';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
