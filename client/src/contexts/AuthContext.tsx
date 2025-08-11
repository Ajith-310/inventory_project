import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserRole, LoginCredentials, AuthResponse } from '../types';
import apiService from '../services/api';

// State interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<void>;
  clearError: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          dispatch({ type: 'AUTH_START' });
          const currentUser = await apiService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: currentUser,
              accessToken: token,
              refreshToken: localStorage.getItem('refreshToken') || '',
            },
          });
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No authentication found' });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response: AuthResponse = await apiService.login(credentials);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Register function
  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response: AuthResponse = await apiService.register(userData);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(userData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    try {
      await apiService.changePassword(passwords);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user has required role(s)
  const hasRole = (roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    clearError,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 