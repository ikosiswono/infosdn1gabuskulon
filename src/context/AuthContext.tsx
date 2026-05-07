import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalAdmin, setIsLocalAdmin] = useState(false);

  // ADMIN CHECK
  const isAdmin =
    isLocalAdmin ||
    user?.email === 'infosdn1gabuskulon@gmail.com';

  // CHECK LOGIN STATUS
  useEffect(() => {
    // cek local admin
    const localAdmin = localStorage.getItem('localAdmin');

    if (localAdmin === 'true') {
      setIsLocalAdmin(true);
    }

    // cek firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // LOGIN FUNCTION
  const login = async (
    email?: string,
    password?: string
  ) => {
    // LOGIN ADMIN LOKAL
    if (
      (email === 'infosdn1gabuskulon' ||
        email === 'infosdn1gabuskulon@gmail.com') &&
      password === 'SDN1g@lon'
    ) {
      localStorage.setItem('localAdmin', 'true');
      setIsLocalAdmin(true);

      return;
    }

    // LOGIN GOOGLE
    if (!email && !password) {
      try {
        const provider = new GoogleAuthProvider();

        await signInWithPopup(auth, provider);

        return;
      } catch (error) {
        console.error('Google login error:', error);
        throw error;
      }
    }

    throw new Error('Invalid credentials');
  };

  // LOGOUT
  const logout = async () => {
    // hapus local admin
    localStorage.removeItem('localAdmin');

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }

    setIsLocalAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
