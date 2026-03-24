import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../data/mockData';
import { socket } from '../lib/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as loading until token is verified

  // On mount: verify token against backend. If invalid, clear session.
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Invalid token');
        const userData = await res.json();
        const normalizedUser: User = {
          ...userData,
          avatar: userData.avatar ?? userData.profilePicture ?? '',
          favorites: userData.favorites ?? [],
          archived: userData.archived ?? [],
          pinned: userData.pinned ?? [],
          chatBackgrounds: userData.chatBackgrounds ?? {},
          settings: userData.settings ?? { theme: 'dark', textSize: 16, disappearTime: 0 },
        };
        setUser(normalizedUser);
      } catch {
        // Token invalid or expired — clear everything
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  // Apply theme from user settings
  useEffect(() => {
    if (user?.settings?.theme) {
      document.documentElement.classList.toggle('dark', user.settings.theme === 'dark');
    }
  }, [user?.settings?.theme]);

  // Manage socket connection based on user authentication
  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('join', user.id);
    } else {
      socket.disconnect();
    }
    
    return () => {
      // Don't arbitrarily disconnect on unmount unless user logs out
    };
  }, [user]);

  const login = (userData: User, token: string) => {
    const normalizedUser: User = {
      ...userData,
      avatar: userData.avatar ?? userData.profilePicture ?? '',
      favorites: userData.favorites ?? [],
      archived: userData.archived ?? [],
      pinned: userData.pinned ?? [],
      chatBackgrounds: userData.chatBackgrounds ?? {},
      settings: userData.settings ?? { theme: 'dark', textSize: 16, disappearTime: 0 },
    };
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    socket.disconnect();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
