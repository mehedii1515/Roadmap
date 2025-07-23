import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { roadmapAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { errorHandlers } from '../utils/errorHandler';

// Memoized Filter Section Component with deep comparison
const FilterSection = React.memo(({ 
  searchInput, 
  filters, 
  onFilterChange, 
  searchInputRef 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Filter & Sort</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search roadmap items..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchInput}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="feature">New Feature</option>
            <option value="improvement">Improvement</option>
            <option value="bug_fix">Bug Fix</option>
            <option value="maintenance">Maintenance</option>
            <option value="research">Research</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.ordering}
            onChange={(e) => onFilterChange('ordering', e.target.value)}
          >
            <option value="-upvote_count_annotated">Most Popular (Most Upvotes)</option>
            <option value="upvote_count_annotated">Least Popular (Least Upvotes)</option>
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for more control
  return (
    prevProps.searchInput === nextProps.searchInput &&
    prevProps.filters.status === nextProps.filters.status &&
    prevProps.filters.category === nextProps.filters.category &&
    prevProps.filters.ordering === nextProps.filters.ordering &&
    prevProps.onFilterChange === nextProps.onFilterChange
  );
});

FilterSection.displayName = 'FilterSection';

// Memoized RoadmapItem Component with deep comparison
const RoadmapItem = React.memo(({ 
  item, 
  onUpvote, 
  isAuthenticated, 
  getStatusColor, 
  getCategoryColor, 
  formatStatus, 
  formatCategory 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                <Link 
                  to={`/roadmap/${item.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.title}
                </Link>
              </h3>
              <div className="flex gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {formatStatus(item.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {formatCategory(item.category)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {item.comments_count || 0}
              </span>
            </div>
            <span className="text-xs whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Upvote Button */}
        <div className="flex flex-col items-center ml-6">
          <button
            onClick={() => onUpvote(item.id)}
            className={`p-3 rounded-full transition-all duration-200 ${
              item.user_upvoted 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
            } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? 'Please log in to upvote' : 'Toggle upvote'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900 mt-2">
            {item.upvote_count}
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for roadmap items
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.upvote_count === nextProps.item.upvote_count &&
    prevProps.item.user_upvoted === nextProps.item.user_upvoted &&
    prevProps.isAuthenticated === nextProps.isAuthenticated &&
    prevProps.onUpvote === nextProps.onUpvote
  );
});

RoadmapItem.displayName = 'RoadmapItem';

const RoadmapList = () => {
  const [roadmapItems, setRoadmapItems] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // For first load only
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    ordering: '-created_at'
  });
  const [searchInput, setSearchInput] = useState(''); // Separate state for search input
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Track if it's the first load
  const searchInputRef = useRef(null); // Ref to maintain focus
  
  const { isAuthenticated } = useAuth();

  // Debounced search effect - no loading indicators
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        const wasSearchInputFocused = document.activeElement === searchInputRef.current;
        
        setFilters(prev => ({
          ...prev,
          search: searchInput
        }));
        
        // Restore focus after state update
        if (wasSearchInputFocused && searchInputRef.current) {
          setTimeout(() => {
            searchInputRef.current.focus();
          }, 0);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.search]);

  // Fetch function with no visible loading states for filters
  const fetchRoadmapItems = useCallback(async () => {
    try {
      // Only show loading on initial page load
      if (isFirstLoad) {
        setInitialLoading(true);
      }
      
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.ordering) params.ordering = filters.ordering;
      
      const response = await roadmapAPI.getItems(params);
      setRoadmapItems(response.data.results || response.data);
      setError('');
    } catch (err) {
      const errorInfo = errorHandlers.dataFetch(err, 'roadmap_items');
      setError(errorInfo.message);
    } finally {
      setInitialLoading(false);
      setIsFirstLoad(false);
    }
  }, [filters.status, filters.category, filters.search, filters.ordering, isFirstLoad]);

  useEffect(() => {
    fetchRoadmapItems();
  }, [fetchRoadmapItems]);

  const handleUpvote = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      alert('Please log in to upvote items');
      return;
    }

    try {
      const response = await roadmapAPI.toggleUpvote(itemId);
      
      // Update the item in the list
      setRoadmapItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              upvote_count: response.data.upvote_count,
              user_upvoted: response.data.upvoted
            }
          : item
      ));
    } catch (err) {
      const errorInfo = errorHandlers.apiRequest(err, 'toggle_upvote');
      alert(errorInfo.message);
    }
  }, [isAuthenticated]);

  // Completely stabilized filter change handler
  const handleFilterChange = useCallback((name, value) => {
    if (name === 'search') {
      setSearchInput(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  // Memoized utility functions with no dependencies
  const getStatusColor = useCallback((status) => {
    const colors = {
      'planning': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      'feature': 'bg-purple-100 text-purple-800',
      'improvement': 'bg-blue-100 text-blue-800',
      'bug_fix': 'bg-red-100 text-red-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'research': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }, []);

  const formatStatus = useCallback((status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, []);

  const formatCategory = useCallback((category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, []);

  // Stable memoized filter props - no loading states
  const stableFilterProps = useMemo(() => ({
    searchInput,
    filters,
    onFilterChange: handleFilterChange,
    searchInputRef
  }), [searchInput, filters, handleFilterChange]);

  // Memoized roadmap items list
  const memoizedRoadmapItems = useMemo(() => {
    return roadmapItems.map((item) => (
      <RoadmapItem
        key={item.id}
        item={item}
        onUpvote={handleUpvote}
        isAuthenticated={isAuthenticated}
        getStatusColor={getStatusColor}
        getCategoryColor={getCategoryColor}
        formatStatus={formatStatus}
        formatCategory={formatCategory}
      />
    ));
  }, [roadmapItems, handleUpvote, isAuthenticated, getStatusColor, getCategoryColor, formatStatus, formatCategory]);

  // Show full page loading only on initial load
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our Development Roadmap
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
            Explore our upcoming features, improvements, and initiatives. Share your feedback, 
            vote on features that matter to you, and help shape the future of our platform.
          </p>
          <p className="text-sm text-gray-500">
            {isAuthenticated ? 
              'You can upvote items and join discussions!' : 
              'Sign in to upvote features and participate in discussions.'
            }
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <FilterSection {...stableFilterProps} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {roadmapItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No roadmap items found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {memoizedRoadmapItems}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapList; 