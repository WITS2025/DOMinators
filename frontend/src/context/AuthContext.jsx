// Create a new file: src/context/AuthContext.jsx
import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children, user, signOut }) => {
  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};