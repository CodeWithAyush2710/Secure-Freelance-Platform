import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'freelancer' | 'client') => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Mock data for demo purposes
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Freelancer",
    email: "john@freelancer.com",
    role: "freelancer",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Experienced web developer with 5+ years in React and Node.js",
    joinedAt: new Date(2022, 1, 15),
    rating: 4.8
  },
  {
    id: "2",
    name: "Sarah Client",
    email: "sarah@company.com",
    role: "client",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Project manager at Tech Solutions Inc.",
    joinedAt: new Date(2021, 5, 10),
    rating: 4.9
  }
];

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading the user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login functionality
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers.find(u => u.email === email);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register functionality
  const register = async (email: string, password: string, name: string, role: 'freelancer' | 'client') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error("User already exists");
      }
      
      // Create new user
      const newUser: User = {
        id: String(mockUsers.length + 1),
        name,
        email,
        role,
        joinedAt: new Date(),
        rating: 0
      };
      
      // In a real app, we would save to database here
      mockUsers.push(newUser);
      
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);