import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roadmapAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { errorHandlers } from '../utils/errorHandler';

// Comment Component with nested functionality
const Comment = ({ comment, roadmapId, onCommentUpdate, level = 0 }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const canEdit = user && user.id === comment.user.id;
  const canReply = user && comment.can_reply; // Use backend's can_reply field
  
  // Function to check if comment was genuinely edited
  const isCommentEdited = (comment) => {
    if (!comment.updated_at || !comment.created_at) return false;
    
    const createdTime = new Date(comment.created_at).getTime();
    const updatedTime = new Date(comment.updated_at).getTime();
    
    // Consider it edited only if there's more than 1 second difference
    // This accounts for small timing differences during creation
    return (updatedTime - createdTime) > 1000;
  };
  
  // Use safe Tailwind classes for indentation
  const getIndentClass = (level) => {
    if (level === 0) return '';
    if (level === 1) return 'ml-8 border-l-2 border-gray-200 pl-4';
    if (level === 2) return 'ml-16 border-l-2 border-gray-200 pl-4';
    return 'ml-24 border-l-2 border-gray-200 pl-4'; // fallback
  };
  
  const indentClass = getIndentClass(level);

  const handleEdit = async () => {
    if (!editContent.trim() || editContent.length > 300) return;
    
    try {
      setLoading(true);
      await commentAPI.updateComment(comment.id, { content: editContent });
      setIsEditing(false);
      onCommentUpdate();
    } catch (error) {
      const errorInfo = errorHandlers.apiRequest(error, 'update_comment');
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      setLoading(true);
      await commentAPI.deleteComment(comment.id);
      onCommentUpdate();
    } catch (error) {
      const errorInfo = errorHandlers.apiRequest(error, 'delete_comment');
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || replyContent.length > 300) return;
    
    try {
      setLoading(true);
      await commentAPI.createComment(roadmapId, {
        content: replyContent,
        parent_comment: comment.id
      });
      setReplyContent('');
      setIsReplying(false);
      onCommentUpdate();
    } catch (error) {
      const errorInfo = errorHandlers.apiRequest(error, 'create_reply');
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${indentClass} ${level > 0 ? 'mt-4' : 'border-b border-gray-100 pb-4 mb-4'}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="font-semibold text-gray-900">
              {comment.user.username}
              {canEdit && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              {new Date(comment.created_at).toLocaleDateString()}
              {isCommentEdited(comment) && ' (edited)'}
            </span>
          </div>
          {canEdit && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength="300"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Edit your comment..."
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {editContent.length}/300 characters
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  disabled={loading || !editContent.trim() || editContent.length > 300}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-3">{comment.content}</p>
            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            )}
          </>
        )}

        {isReplying && (
          <div className="mt-4 space-y-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength="300"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Write your reply..."
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {replyContent.length}/300 characters
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  disabled={loading || !replyContent.trim() || replyContent.length > 300}
                >
                  {loading ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.map(reply => (
        <Comment
          key={reply.id}
          comment={reply}
          roadmapId={roadmapId}
          onCommentUpdate={onCommentUpdate}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const RoadmapDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [roadmapItem, setRoadmapItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchRoadmapItem();
      if (isAuthenticated) {
        await fetchComments();
      }
    };
    
    loadData();
  }, [id, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoadmapItem = async () => {
    try {
      setLoading(true);
      const response = await roadmapAPI.getItem(id);
      setRoadmapItem(response.data);
      setError('');
    } catch (err) {
      const errorInfo = errorHandlers.dataFetch(err, 'roadmap_item');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(id);
      
      // Handle paginated response
      const commentData = response.data.results || response.data;
      
      if (Array.isArray(commentData)) {
        setComments(organizeComments(commentData));
      } else {
        setComments([]);
      }
    } catch (err) {
      errorHandlers.dataFetch(err, 'comments');
      setComments([]);
    }
  };

  // Organize comments into nested structure
  const organizeComments = (commentList) => {
    if (!Array.isArray(commentList)) {
      return [];
    }

    const commentMap = {};
    const rootComments = [];

    // First pass: create comment map with all original properties preserved
    commentList.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: organize into tree structure
    commentList.forEach(comment => {
      if (comment.parent_comment) {
        if (commentMap[comment.parent_comment]) {
          commentMap[comment.parent_comment].replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      alert('Please log in to upvote items');
      return;
    }

    try {
      const response = await roadmapAPI.toggleUpvote(id);
      setRoadmapItem(prev => ({
        ...prev,
        upvote_count: response.data.upvote_count,
        user_upvoted: response.data.upvoted
      }));
    } catch (err) {
      const errorInfo = errorHandlers.apiRequest(err, 'toggle_upvote');
      alert(errorInfo.message);
    }
  };

  const handleNewComment = async () => {
    if (!newComment.trim() || newComment.length > 300) return;
    
    try {
      setCommentLoading(true);
      await commentAPI.createComment(id, { content: newComment });
      setNewComment('');
      await fetchComments(); // Refresh comments
    } catch (error) {
      const errorInfo = errorHandlers.apiRequest(error, 'create_comment');
      alert(errorInfo.message);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !roadmapItem) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Roadmap item not found'}
        </div>
        <Link to="/" className="text-primary-600 hover:text-primary-500">
          ← Back to Roadmap
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/" className="text-primary-600 hover:text-primary-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Roadmap
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{roadmapItem.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                roadmapItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                roadmapItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                roadmapItem.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                roadmapItem.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {roadmapItem.status.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                roadmapItem.category === 'feature' ? 'bg-purple-100 text-purple-800' :
                roadmapItem.category === 'improvement' ? 'bg-blue-100 text-blue-800' :
                roadmapItem.category === 'bug_fix' ? 'bg-red-100 text-red-800' :
                roadmapItem.category === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {roadmapItem.category.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {roadmapItem.description}
            </p>
          </div>
          
          <div className="flex flex-col items-center ml-6">
            <button
              onClick={handleUpvote}
              className={`p-3 rounded-full transition-colors ${
                roadmapItem.user_upvoted 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAuthenticated}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-lg font-bold text-gray-900 mt-2">
              {roadmapItem.upvote_count}
            </span>
            <span className="text-sm text-gray-500">votes</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>
        

        
        {!isAuthenticated ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-600">
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                Log in
              </Link> to leave comments and participate in discussions.
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength="300"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="4"
                placeholder="Share your thoughts about this roadmap item..."
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {newComment.length}/300 characters
                </span>
                <button
                  onClick={handleNewComment}
                  className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={commentLoading || !newComment.trim() || newComment.length > 300}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {comments.length > 0 ? (
          <div className="space-y-6">

            
            {comments.map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                roadmapId={id}
                onCommentUpdate={fetchComments}
                level={0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No comments yet</p>
            <p className="text-gray-400">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDetail; 