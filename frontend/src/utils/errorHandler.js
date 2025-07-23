/**
 * Error handling utilities for the roadmap application
 * Provides centralized error logging and user-friendly error messages
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// User-friendly error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Connection failed. Please check your internet connection and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication failed. Please log in again.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Categorize error based on response status or error type
 */
function categorizeError(error) {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;
  
  if (status === 401 || status === 403) {
    return ERROR_TYPES.AUTHENTICATION;
  }
  
  if (status >= 400 && status < 500) {
    return ERROR_TYPES.VALIDATION;
  }
  
  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }
  
  return ERROR_TYPES.UNKNOWN;
}

/**
 * Extract user-friendly message from error
 */
function extractErrorMessage(error, fallbackMessage) {
  // Try to get message from response data
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle different response formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    if (data.detail) {
      return data.detail;
    }
    
    // Handle validation errors
    if (data.non_field_errors) {
      return data.non_field_errors[0];
    }
    
    // Handle field-specific errors
    const firstFieldError = Object.values(data).find(value => 
      Array.isArray(value) && value.length > 0
    );
    if (firstFieldError) {
      return firstFieldError[0];
    }
  }
  
  // Use error message if available
  if (error.message) {
    return error.message;
  }
  
  return fallbackMessage;
}

/**
 * Log error for development/debugging purposes
 * In production, this could send to error monitoring service
 */
function logError(error, context = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Details');
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Stack:', error.stack);
    console.groupEnd();
  } else {
    // In production, send to error monitoring service
    // Example: Sentry.captureException(error, { extra: context });
    
    // For now, just log minimal info
    console.error('Application Error:', {
      message: error.message,
      context: context.action || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Main error handler function
 * Logs error and returns user-friendly message
 */
export function handleError(error, context = {}) {
  const errorType = categorizeError(error);
  const defaultMessage = ERROR_MESSAGES[errorType];
  const userMessage = extractErrorMessage(error, defaultMessage);
  
  // Log error with context
  logError(error, {
    type: errorType,
    ...context
  });
  
  return {
    type: errorType,
    message: userMessage,
    isNetworkError: errorType === ERROR_TYPES.NETWORK,
    isAuthError: errorType === ERROR_TYPES.AUTHENTICATION,
    shouldRetry: errorType === ERROR_TYPES.NETWORK || errorType === ERROR_TYPES.SERVER
  };
}

/**
 * Specific error handlers for common scenarios
 */
export const errorHandlers = {
  // API request errors
  apiRequest: (error, action) => handleError(error, { 
    action, 
    component: 'API' 
  }),
  
  // Authentication errors
  authentication: (error, action) => handleError(error, { 
    action, 
    component: 'Auth',
    sensitive: true // Don't log sensitive auth details
  }),
  
  // Form submission errors
  formSubmission: (error, formName) => handleError(error, { 
    action: 'form_submit', 
    form: formName 
  }),
  
  // Data fetching errors
  dataFetch: (error, resource) => handleError(error, { 
    action: 'fetch_data', 
    resource 
  }),
  
  // Upload errors
  upload: (error, fileType) => handleError(error, { 
    action: 'file_upload', 
    fileType 
  })
};

/**
 * Create error boundary error handler
 */
export function createErrorBoundaryHandler(componentName) {
  return (error, errorInfo) => {
    logError(error, {
      component: componentName,
      errorBoundary: true,
      componentStack: errorInfo.componentStack
    });
  };
}

/**
 * Network status checker
 */
export function isNetworkError(error) {
  return !error.response && (
    error.code === 'NETWORK_ERROR' ||
    error.message === 'Network Error' ||
    !navigator.onLine
  );
}

/**
 * Retry helper for failed requests
 */
export async function retryRequest(requestFn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const errorInfo = handleError(error, { 
        action: 'retry_request', 
        attempt, 
        maxRetries 
      });
      
      if (attempt === maxRetries || !errorInfo.shouldRetry) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

export default handleError; 