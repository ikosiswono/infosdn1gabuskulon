import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalAdmin, setIsLocalAdmin] = useState(false);

  const isAdmin = isLocalAdmin || user?.email === 'infosdn1gabuskulon@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.email === 'infosdn1gabuskulon@gmail.com') {
        setIsLocalAdmin(true);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email?: string, password?: string) => {
    // Check if it's the requested local admin account
    if ((email === 'infosdn1gabuskulon' || email === 'infosdn1gabuskulon@gmail.com') && password === 'SDN1g@lon') {
      const fullEmail = email.includes('@') ? email : 'infosdn1gabuskulon@gmail.com';
      
      try {
        // Try to sign in with email/password to get a real firebase session
        await signInWithEmailAndPassword(auth, fullEmail, password);
        setIsLocalAdmin(true);
      } catch (authError: any) {
        console.warn('Firebase Auth failed, falling back to local admin state. DB writes may fail if auth is not configured in console.', authError);
        // Fallback to local admin even if firebase auth fails (e.g. user not created or provider disabled)
        setIsLocalAdmin(true);
      }
      return;
    }

    // If those specific credentials didn't match, and the user provided them, fail it.
    if (email || password) {
      throw new Error('Invalid credentials');
    }

    // Only if no email/pass provided, allow Google login (though the admin UI doesn't use this directly)
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsLocalAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
