"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) router.push("/admin/dashboard");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", data.username);
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 bg-[#d4a853] top-0 right-0" />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-[#ff6b35] bottom-0 left-0" />

      <div className="particles">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🍽️</span>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin Portal
          </h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to manage your restaurant</p>
        </div>

        {/* Login card */}
        <div className="glass rounded-3xl p-8 pulse-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold text-base hover:shadow-2xl hover:shadow-[#d4a853]/30 transition-all disabled:opacity-50 btn-ripple"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-gray-500 hover:text-[#d4a853] text-sm transition-colors">
            ← Back to Website
          </a>
        </p>
      </div>
    </div>
  );
}
