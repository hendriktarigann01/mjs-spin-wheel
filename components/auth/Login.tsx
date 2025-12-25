"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === "adminmjs" && password === "wifilantai2") {
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 1 day
      localStorage.setItem("adminAuth", JSON.stringify({ expiry: expiryTime }));
      onLogin();
      setError("");
    } else {
      setError("Incorrect Username or Password");
    }
  };

  return (
    <div className="min-h-screen relative bg-[#17242B] flex items-center justify-center p-4">
      <div className="hidden md:block absolute top-0 left-0 w-100 h-100">
        <Image src="/entry-top.webp" fill alt="top" />
      </div>
      <div className="hidden md:block absolute bottom-0 right-0 w-100 h-100">
        <Image src="/entry-bottom.webp" fill alt="bottom" />
      </div>

      <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-16 flex mx-auto mb-4">
            <Image
              src="/logo/mjs_logo.png"
              width={150}
              height={40}
              alt="logo"
            />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">
            Admin Login
          </h1>
          <p className="text-white/80 mt-2 font-medium">Spin Wheel</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all shadow-sm"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all shadow-sm pr-12"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/30 backdrop-blur-md border border-red-500/50 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-white/90 hover:bg-white text-teal-600 font-bold py-3 rounded-xl transition-all duration-300 shadow-lg active:scale-95"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
