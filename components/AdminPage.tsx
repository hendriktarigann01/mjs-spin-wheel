"use client";

import { useState } from "react";
import { Login } from "@/components/auth/Login";
import { Dashboard } from "@/components/auth/Dashboard";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authData = localStorage.getItem("adminAuth");
    if (authData) {
      try {
        const { expiry } = JSON.parse(authData);
        if (Date.now() < expiry) {
          return true;
        } else {
          localStorage.removeItem("adminAuth");
        }
      } catch {
        localStorage.removeItem("adminAuth");
      }
    }
    return false;
  });

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
