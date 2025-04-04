// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; 


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  
  const checkAuthStatus = useCallback(() => {
    setIsLoading(true); 
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken); 
        const currentTime = Date.now() / 1000; 

        if (decoded.exp && decoded.exp < currentTime) {
            console.warn('Token expired, logging out.');
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsLoggedIn(false);
        } else {
            setToken(storedToken);
            setUser({ userId: decoded.userId, role: decoded.role });
            setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []); 


  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);


  const login = (newToken, userData) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(userData || null); 
    setIsLoggedIn(true);
     try {
        const decoded = jwtDecode(newToken);
        setUser({ userId: decoded.userId, role: decoded.role });
      } catch(e){setUser(null);}
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    token,
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuthStatus 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};