import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
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

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

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

// Main content component that handles routing
const AppRoutes = React.memo(() => {
  const location = useLocation();
  
  // Determine if we need layout for current route
  const needsLayout = useMemo(() => {
    const noLayoutRoutes = ['/login', '/register'];
    return !noLayoutRoutes.includes(location.pathname);
  }, [location.pathname]);

  const routeContent = useMemo(() => (
    <Routes>
      {/* Public routes with layout */}
      <Route path="/" element={<RoadmapList />} />
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

  if (needsLayout) {
    return (
      <Layout>
        {routeContent}
      </Layout>
    );
  }

  return routeContent;
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
