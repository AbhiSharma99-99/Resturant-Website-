"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface FoodItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  categoryId: number;
  images: string[] | null;
  isVeg: boolean;
  isBestseller: boolean;
  isNew: boolean;
  isOutOfStock: boolean;
  prepTime: string | null;
  rating: number | null;
  reviewCount: number | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  data: {
    foods: FoodItem[];
    categories: Category[];
    settings: Record<string, string>;
  };
}

const EMOJIS: Record<string, string> = {
  pizza: "🍕", burger: "🍔", chinese: "🥡", drinks: "🍹",
  desserts: "🍰", indian: "🍛", combos: "🎁", "special-offers": "⭐",
};

export default function HomeClient({ data }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<Array<{ food: FoodItem; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("fh_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("fh_cart", JSON.stringify(cart));
  }, [cart]);

  const restaurantName = data.settings.restaurant_name || "Flavour House";
  const tagline = data.settings.restaurant_tagline || "Where Every Bite Tells a Story";

  const filteredFoods = data.foods.filter(f => {
    const catMatch = activeCategory === "all" || data.categories.find(c => c.slug === activeCategory)?.id === f.categoryId;
    const searchMatch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const bestsellers = data.foods.filter(f => f.isBestseller);
  const newItems = data.foods.filter(f => f.isNew);

  const addToCart = (food: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.food.id === food.id);
      if (existing) return prev.map(i => i.food.id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { food, quantity: 1 }];
    });
  };

  const removeFromCart = (foodId: number) => {
    setCart(prev => prev.filter(i => i.food.id !== foodId));
  };

  const updateQuantity = (foodId: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.food.id !== foodId) return i;
      const newQty = i.quantity + delta;
      return newQty <= 0 ? i : { ...i, quantity: newQty };
    }).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.food.discountPrice || i.food.price) * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const bg = darkMode ? "bg-[#0a0a0a]" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const cardBg = darkMode ? "bg-[#141414]" : "bg-white";
  const borderColor = darkMode ? "border-[#2a2a2a]" : "border-gray-200";

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[9999]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d4a853] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#f0d68a] animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🍽️</div>
          </div>
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>
            {restaurantName}
          </h1>
          <p className="text-gray-500 mt-2 text-sm tracking-widest uppercase">{tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
      {/* Particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
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

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50 ? (darkMode ? "glass bg-[#0a0a0a]/80" : "glass-light") + " shadow-2xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:animate-bounce transition-all">🍽️</span>
            <div>
              <h1 className={`text-xl font-bold ${textPrimary}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                {restaurantName}
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">Premium Dining</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Menu", "About", "Contact"].map(item => (
              <a
                key={item}
                href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                className={`${textSecondary} hover:text-[#d4a853] transition-colors text-sm font-medium tracking-wide uppercase`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "bg-[#1a1a1a]" : "bg-gray-200"} transition-colors`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* Cart button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 rounded-full bg-[#d4a853]/10 hover:bg-[#d4a853]/20 transition-colors"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ef4444] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth links */}
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black text-sm font-semibold hover:shadow-lg hover:shadow-[#d4a853]/25 transition-all btn-ripple"
            >
              Sign In
            </Link>

            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <span className="text-2xl">{showMobileMenu ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {showMobileMenu && (
          <div className={`md:hidden ${darkMode ? "glass bg-[#0a0a0a]/95" : "glass-light"} px-4 pb-4 fade-in-up`}>
            {["Home", "Menu", "About", "Contact"].map(item => (
              <a
                key={item}
                href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                onClick={() => setShowMobileMenu(false)}
                className={`block py-3 ${textSecondary} hover:text-[#d4a853] transition-colors text-sm font-medium border-b ${borderColor}`}
              >
                {item}
              </a>
            ))}
            <Link href="/login" className="block py-3 text-[#d4a853] font-semibold text-sm">
              Sign In / Register
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a]" />
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
            style={{
              background: "radial-gradient(circle, #d4a853, transparent)",
              top: "10%",
              right: "10%",
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
            style={{
              background: "radial-gradient(circle, #ff6b35, transparent)",
              bottom: "20%",
              left: "10%",
              transform: `translateY(${scrollY * -0.05}px)`,
            }}
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="fade-in-up">
            <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase mb-4 font-medium">
              ✦ Welcome to {restaurantName} ✦
            </p>
            <h1
              className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="gradient-text">Experience</span>
              <br />
              <span className={textPrimary}>Culinary Excellence</span>
            </h1>
            <p className={`${textSecondary} text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed`}>
              Indulge in a symphony of flavors crafted by world-renowned chefs.
              Every dish is a masterpiece, every moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#menu"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold text-base hover:shadow-2xl hover:shadow-[#d4a853]/30 transition-all transform hover:scale-105 btn-ripple"
              >
                Explore Menu →
              </a>
              <Link
                href="/admin/login"
                className={`px-8 py-4 rounded-full border ${borderColor} ${textSecondary} font-semibold text-base hover:border-[#d4a853] hover:text-[#d4a853] transition-all`}
              >
                Admin Portal
              </Link>
            </div>
          </div>

          {/* Floating food emojis */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {["🍕", "🍔", "🍰", "🍹", "🍛", "🥡"].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-4xl opacity-20 animate-float"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.8}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className={`text-xs ${textSecondary} tracking-widest uppercase`}>Scroll Down</span>
          <div className="w-6 h-10 rounded-full border-2 border-[#d4a853]/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-[#d4a853] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className={`py-8 ${darkMode ? "bg-[#111]" : "bg-white"} border-y ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "50+", label: "Menu Items", emoji: "🍽️" },
            { value: "10K+", label: "Happy Customers", emoji: "😊" },
            { value: "4.8", label: "Average Rating", emoji: "⭐" },
            { value: "30min", label: "Fast Delivery", emoji: "🚀" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <span className="text-2xl mb-2 block group-hover:scale-125 transition-transform">{stat.emoji}</span>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase mb-3">⭐ Customer Favorites</p>
              <h2
                className={`text-4xl sm:text-5xl font-bold ${textPrimary}`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Our Bestsellers
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestsellers.slice(0, 6).map((food, i) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  darkMode={darkMode}
                  onAddToCart={addToCart}
                  category={data.categories.find(c => c.id === food.categoryId)}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className={`py-20 px-4 ${darkMode ? "bg-[#111]" : "bg-gray-100"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase mb-3">🍴 Browse By</p>
            <h2
              className={`text-4xl sm:text-5xl font-bold ${textPrimary}`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.categories.map((cat, i) => (
              <a
                key={cat.id}
                href="#menu"
                onClick={() => setActiveCategory(cat.slug)}
                className={`card-3d ${cardBg} border ${borderColor} rounded-2xl p-6 text-center group cursor-pointer`}
              >
                <span className="text-5xl block mb-3 group-hover:scale-110 transition-transform">
                  {EMOJIS[cat.slug] || "🍴"}
                </span>
                <p className={`font-semibold ${textPrimary}`}>{cat.name}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Full Menu */}
      <section id="menu" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase mb-3">🍽️ Explore</p>
            <h2
              className={`text-4xl sm:text-5xl font-bold ${textPrimary}`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Our Menu
            </h2>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className={`relative ${cardBg} border ${borderColor} rounded-full overflow-hidden`}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search for your favourite food..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-transparent ${textPrimary} text-sm focus:outline-none`}
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black"
                  : `${cardBg} border ${borderColor} ${textSecondary} hover:border-[#d4a853]`
              }`}
            >
              All
            </button>
            {data.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? "bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black"
                    : `${cardBg} border ${borderColor} ${textSecondary} hover:border-[#d4a853]`
                }`}
              >
                {EMOJIS[cat.slug] || "🍴"} {cat.name}
              </button>
            ))}
          </div>

          {/* Foods grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((food, i) => (
              <FoodCard
                key={food.id}
                food={food}
                darkMode={darkMode}
                onAddToCart={addToCart}
                category={data.categories.find(c => c.id === food.categoryId)}
                index={i}
              />
            ))}
          </div>

          {filteredFoods.length === 0 && (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">😔</span>
              <p className={`text-xl ${textSecondary}`}>No items found</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-20 px-4 ${darkMode ? "bg-[#111]" : "bg-gray-100"}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase mb-3">🏆 Our Story</p>
            <h2
              className={`text-4xl sm:text-5xl font-bold ${textPrimary} mb-6`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Crafting Culinary <span className="gradient-text">Masterpieces</span>
            </h2>
            <p className={`${textSecondary} leading-relaxed mb-6`}>
              At {restaurantName}, we believe food is an art form. Our world-class chefs blend traditional techniques
              with innovative flavors to create dishes that tell a story. Every ingredient is carefully sourced,
              every recipe perfected over generations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: "👨‍🍳", label: "Expert Chefs" },
                { emoji: "🌿", label: "Fresh Ingredients" },
                { emoji: "⚡", label: "Fast Delivery" },
                { emoji: "💯", label: "Quality First" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${cardBg} border ${borderColor}`}>
                  <span className="text-2xl">{item.emoji}</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className={`aspect-square rounded-3xl ${cardBg} border ${borderColor} flex items-center justify-center overflow-hidden`}>
              <div className="text-center p-8">
                <span className="text-9xl block mb-4 animate-float">👨‍🍳</span>
                <p className={`text-xl font-bold ${textPrimary}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  10+ Years of Excellence
                </p>
                <p className={`${textSecondary} mt-2`}>Serving happiness since 2014</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4a853] to-[#b8922e] flex items-center justify-center text-3xl animate-float-delayed shadow-lg">
              ⭐
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#d4a853] text-sm tracking-[0.3em] uppercase mb-3">📍 Visit Us</p>
          <h2
            className={`text-4xl sm:text-5xl font-bold ${textPrimary} mb-8`}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get In Touch
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { emoji: "📍", title: "Address", value: data.settings.restaurant_address || "123 Gourmet Street, Mumbai" },
              { emoji: "📞", title: "Phone", value: data.settings.restaurant_phone || "+91 98765 43210" },
              { emoji: "🕐", title: "Hours", value: `${data.settings.opening_hours || "11 AM"} - ${data.settings.closing_hours || "11 PM"}` },
            ].map((info, i) => (
              <div key={i} className={`${cardBg} border ${borderColor} rounded-2xl p-6 card-3d`}>
                <span className="text-4xl block mb-3">{info.emoji}</span>
                <p className={`font-semibold ${textPrimary} mb-1`}>{info.title}</p>
                <p className={`text-sm ${textSecondary}`}>{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 ${darkMode ? "bg-[#050505]" : "bg-gray-900"} border-t border-[#2a2a2a]`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🍽️</span>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {restaurantName}
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{tagline}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {["Menu", "About Us", "Contact", "Admin"].map(link => (
                  <a key={link} href={link === "Admin" ? "/admin/login" : `#${link.toLowerCase().replace(" ", "")}`}
                    className="block text-gray-500 hover:text-[#d4a853] text-sm transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Policies</h4>
              <div className="space-y-2">
                {["Terms & Conditions", "Privacy Policy", "Refund Policy", "FAQs"].map(link => (
                  <span key={link} className="block text-gray-500 text-sm cursor-pointer hover:text-[#d4a853] transition-colors">
                    {link}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-[#2a2a2a] pt-6 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} {restaurantName}. All rights reserved. Crafted with ❤️
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md ${darkMode ? "bg-[#0a0a0a]" : "bg-white"} shadow-2xl flex flex-col fade-in-up`}>
            <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
              <h3 className={`text-xl font-bold ${textPrimary}`}>Your Cart ({cartCount})</h3>
              <button onClick={() => setShowCart(false)} className="text-2xl text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl block mb-4">🛒</span>
                  <p className={textSecondary}>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.food.id} className={`${cardBg} border ${borderColor} rounded-xl p-4 flex items-center gap-4`}>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4a853]/20 to-[#d4a853]/5 flex items-center justify-center text-2xl flex-shrink-0">
                      {EMOJIS[data.categories.find(c => c.id === item.food.categoryId)?.slug || ""] || "🍴"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${textPrimary} text-sm truncate`}>{item.food.name}</p>
                      <p className="text-[#d4a853] font-bold text-sm">₹{item.food.discountPrice || item.food.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.food.id, -1)} className="w-7 h-7 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-sm font-bold hover:bg-[#d4a853] hover:text-black transition-colors">−</button>
                      <span className={`w-6 text-center font-bold text-sm ${textPrimary}`}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.food.id, 1)} className="w-7 h-7 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-sm font-bold hover:bg-[#d4a853] hover:text-black transition-colors">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.food.id)} className="text-red-500 hover:text-red-400 text-lg">🗑️</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className={`p-6 border-t ${borderColor} space-y-4`}>
                <div className="flex justify-between">
                  <span className={textSecondary}>Subtotal</span>
                  <span className={`font-bold ${textPrimary}`}>₹{cartTotal.toFixed(2)}</span>
                </div>
                <Link
                  href={`/checkout?cart=${encodeURIComponent(JSON.stringify(cart))}`}
                  onClick={() => setShowCart(false)}
                  className="block w-full py-4 rounded-full bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold text-center hover:shadow-lg hover:shadow-[#d4a853]/30 transition-all btn-ripple"
                >
                  Proceed to Checkout →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Food Card component
function FoodCard({
  food,
  darkMode,
  onAddToCart,
  category,
  index,
}: {
  food: FoodItem;
  darkMode: boolean;
  onAddToCart: (f: FoodItem) => void;
  category?: Category;
  index: number;
}) {
  const cardBg = darkMode ? "bg-[#141414]" : "bg-white";
  const borderColor = darkMode ? "border-[#2a2a2a]" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const discount = food.discountPrice ? Math.round(((food.price - food.discountPrice) / food.price) * 100) : 0;

  return (
    <div
      className={`card-3d ${cardBg} border ${borderColor} rounded-2xl overflow-hidden group`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image area */}
      <div className="relative h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center overflow-hidden">
        <span className="text-7xl group-hover:scale-125 transition-transform duration-500">
          {EMOJIS[category?.slug || ""] || "🍴"}
        </span>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {food.isBestseller && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black text-[10px] font-bold uppercase tracking-wider">
              ⭐ Bestseller
            </span>
          )}
          {food.isNew && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
              ✨ New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Veg/Non-veg badge */}
        <div className="absolute top-3 right-3">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${food.isVeg ? "border-green-500" : "border-red-500"}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${food.isVeg ? "bg-green-500" : "bg-red-500"}`} />
          </div>
        </div>

        {food.isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500/80 px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className={`font-bold ${textPrimary} text-base truncate`}>{food.name}</h3>
          <p className={`text-xs ${textSecondary} line-clamp-2 mt-1`}>{food.description}</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {food.rating && food.rating > 0 && (
            <span className="flex items-center gap-1 text-[#d4a853]">
              ⭐ {food.rating.toFixed(1)}
              <span className={textSecondary}>({food.reviewCount})</span>
            </span>
          )}
          {food.prepTime && (
            <span className={`${textSecondary} flex items-center gap-1`}>
              ⏱️ {food.prepTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#d4a853] font-bold text-lg">
              ₹{food.discountPrice || food.price}
            </span>
            {food.discountPrice && (
              <span className={`${textSecondary} line-through text-sm`}>₹{food.price}</span>
            )}
          </div>
          <button
            onClick={() => !food.isOutOfStock && onAddToCart(food)}
            disabled={food.isOutOfStock}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all btn-ripple ${
              food.isOutOfStock
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black hover:shadow-lg hover:shadow-[#d4a853]/30 hover:scale-105"
            }`}
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}
