import React from 'react';
import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-accent-600">
              Roadmap App
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-primary-700 hover:text-accent-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/roadmap"
              className="text-primary-700 hover:text-accent-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Roadmap
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
