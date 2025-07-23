import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import * as api from './services/api';

// Mock the API services
jest.mock('./services/api');

// Mock window.confirm for delete operations
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});

// Mock window.alert for error messages
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

// Mock data
const mockRoadmapItems = [
  {
    id: 1,
    title: 'Test Feature',
    description: 'Test description',
    status: 'planning',
    category: 'feature',
    priority: 5,
    upvote_count: 10,
    user_upvoted: false,
    comments_count: 3,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.roadmapAPI.getItems.mockResolvedValue({ data: { results: mockRoadmapItems } });
  });

  test('renders roadmap list', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Product Roadmap')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    api.roadmapAPI.getItems.mockRejectedValue({
      response: { status: 500, data: { error: 'Server error' } }
    });

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
