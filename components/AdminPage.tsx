"use client";

import { useState, useEffect } from "react";
import { Login } from "@/components/auth/Login";
import { Dashboard } from "@/components/auth/Dashboard";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authData = localStorage.getItem("adminAuth");
    if (authData) {
      try {
        const { expiry } = JSON.parse(authData);
        if (Date.now() < expiry) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminAuth");
        }
      } catch (error) {
        localStorage.removeItem("adminAuth");
      }
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
