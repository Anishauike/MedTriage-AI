import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USERS: User[] = [
  { id: '1', email: 'admin@hospital.com', name: 'System Admin', role: 'Admin' },
  { id: '2', email: 'receptionist@hospital.com', name: 'Front Desk', role: 'Receptionist' },
  { id: '3', email: 'ambulance@hospital.com', name: 'Ambulance Team', role: 'Ambulance Controller' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medtriage_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('medtriage_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('medtriage_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medtriage_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('medtriage_all_users', JSON.stringify(users));
  }, [users]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic - in a real app, this would be an API call
    const foundUser = users.find(u => u.email === email);
    
    // Simple password check for demo purposes
    const expectedPassword = email.split('@')[0] + '123';
    
    if (foundUser && password === expectedPassword) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, users, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
