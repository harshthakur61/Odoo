import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Demo users for quick login without backend
const DEMO_USERS = {
  'admin@transitops.com': { id: 1, name: 'Admin User', email: 'admin@transitops.com', role: 'Fleet Manager' },
  'dispatcher@transitops.com': { id: 2, name: 'Mark Reynolds', email: 'dispatcher@transitops.com', role: 'Dispatcher' },
  'field@transitops.com': { id: 5, name: 'Elena Rodriguez', email: 'field@transitops.com', role: 'Driver' },
  'safety@transitops.com': { id: 3, name: 'Sarah Chen', email: 'safety@transitops.com', role: 'Safety Officer' },
  'finance@transitops.com': { id: 4, name: 'James Wright', email: 'finance@transitops.com', role: 'Financial Analyst' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    const savedUser = localStorage.getItem('transitops_user');
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Try demo login first (works without backend)
    const demoUser = DEMO_USERS[email];
    if (demoUser) {
      const fakeToken = 'demo_' + btoa(email);
      localStorage.setItem('transitops_token', fakeToken);
      localStorage.setItem('transitops_user', JSON.stringify(demoUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${fakeToken}`;
      setUser(demoUser);
      return { success: true, user: demoUser };
    }

    // Fall back to real backend API
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('transitops_token', token);
      localStorage.setItem('transitops_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Check credentials or use a demo account.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
