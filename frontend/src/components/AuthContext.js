import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const login = async ({ username, password, role }) => {
    try {
      const res = await axios.post('http://localhost:8000/api/token/', {

        username,
        password,
        role,
      });
      setToken(res.data.access);
      setUserRole(role);
      // You can save token in localStorage if needed
    } catch (err) {
      throw err;  // Let the caller (Login.js) catch the error and display message
    }
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    // remove token from localStorage if stored
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
