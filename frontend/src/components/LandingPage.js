import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-accent-600">
                Roadmap App
              </h1>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-primary-700 hover:text-accent-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-900 mb-6">
            Shape the Future of Our Platform
          </h1>
          <p className="text-xl text-primary-700 mb-8 max-w-3xl mx-auto">
            Join our community to explore upcoming features, vote on what matters most to you, 
            and help us build something amazing together.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link
              to="/register"
              className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Join the Community
            </Link>
            <Link
              to="/roadmap"
              className="bg-white hover:bg-primary-50 text-accent-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-accent-600 transition-colors shadow-sm"
            >
              View Roadmap
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-3">
              Explore Features
            </h3>
            <p className="text-primary-700">
              Discover upcoming features and improvements planned for our platform. 
              See what's in development and what's coming next.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-3">
              Vote & Prioritize
            </h3>
            <p className="text-primary-700">
              Cast your vote on features that matter most to you. 
              Help us prioritize development based on community needs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-3">
              Share Feedback
            </h3>
            <p className="text-primary-700">
              Join discussions, share your thoughts, and provide valuable feedback 
              to help shape the direction of our platform.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-accent-600 rounded-2xl p-12 mt-20 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-accent-100 text-lg mb-8">
            Join thousands of users who are already helping shape our platform's future.
          </p>
          <Link
            to="/register"
            className="bg-white hover:bg-primary-50 text-accent-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block shadow-lg"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-primary-200 mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-600 text-sm">
            <p>&copy; 2025 Copyright reserved Md Mehedi Hasan</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
