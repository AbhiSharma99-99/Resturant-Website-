"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 bg-[#d4a853] top-0 left-0" />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-[#ff6b35] bottom-0 right-0" />

      <div className="particles">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${15 + Math.random() * 10}s` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md fade-in-up">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-5xl block mb-4 hover:scale-110 transition-transform inline-block">🍽️</span>
          </Link>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isLogin ? "Sign in to continue ordering" : "Join us for an amazing dining experience"}
          </p>
        </div>

        <div className="glass rounded-3xl p-8 pulse-glow">
          {/* Toggle */}
          <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-6">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? "bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black" : "text-gray-400"}`}>
              Sign In
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? "bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black" : "text-gray-400"}`}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">{error}</div>}

            {!isLogin && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">👤</span>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" placeholder="Your name" required />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">📧</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">🔒</span>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">🔒</span>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" placeholder="••••••••" required />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold text-base hover:shadow-2xl hover:shadow-[#d4a853]/30 transition-all disabled:opacity-50 btn-ripple">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                isLogin ? "Sign In →" : "Create Account →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-[#d4a853] text-sm transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
