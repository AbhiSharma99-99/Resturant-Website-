"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  activeCustomers: number;
  totalFoods: number;
  monthlyData: Array<{ month: string; orders: number; revenue: number }>;
}

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
  isActive: boolean;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

interface OrderItem {
  id: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface CouponItem {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  expiryDate: string | null;
  isActive: boolean;
}

interface CustomerItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isBlocked: boolean;
  loyaltyPoints: number;
  createdAt: string;
}

type Section = "dashboard" | "foods" | "categories" | "orders" | "coupons" | "customers" | "settings";

const SECTIONS: Array<{ key: Section; label: string; emoji: string }> = [
  { key: "dashboard", label: "Dashboard", emoji: "📊" },
  { key: "foods", label: "Food Management", emoji: "🍕" },
  { key: "categories", label: "Categories", emoji: "📂" },
  { key: "orders", label: "Orders", emoji: "📦" },
  { key: "coupons", label: "Coupons", emoji: "🎟️" },
  { key: "customers", label: "Customers", emoji: "👥" },
  { key: "settings", label: "Settings", emoji: "⚙️" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [foodsList, setFoodsList] = useState<FoodItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [couponsList, setCouponsList] = useState<CouponItem[]>([]);
  const [customersList, setCustomersList] = useState<CustomerItem[]>([]);
  const [settingsData, setSettingsData] = useState<Record<string, string>>({});
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [adminUser, setAdminUser] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/admin/login"); return; }
    setAdminUser(localStorage.getItem("admin_user") || "Admin");
  }, [router]);

  const fetchData = useCallback(async (section: Section) => {
    try {
      if (section === "dashboard") {
        const res = await fetch("/api/admin/dashboard");
        setDashData(await res.json());
      } else if (section === "foods") {
        const [fRes, cRes] = await Promise.all([fetch("/api/admin/foods"), fetch("/api/admin/categories")]);
        setFoodsList(await fRes.json());
        setCategoriesList(await cRes.json());
      } else if (section === "categories") {
        const res = await fetch("/api/admin/categories");
        setCategoriesList(await res.json());
      } else if (section === "orders") {
        const res = await fetch("/api/admin/orders");
        setOrdersList(await res.json());
      } else if (section === "coupons") {
        const res = await fetch("/api/admin/coupons");
        setCouponsList(await res.json());
      } else if (section === "customers") {
        const res = await fetch("/api/admin/customers");
        setCustomersList(await res.json());
      } else if (section === "settings") {
        const res = await fetch("/api/admin/settings");
        setSettingsData(await res.json());
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchData(activeSection);
  }, [activeSection, fetchData]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0f0f0f] border-r border-[#1a1a1a] flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-[#1a1a1a] flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🍽️</span>
          {sidebarOpen && (
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                Flavour House
              </h2>
              <p className="text-[#d4a853] text-[10px] tracking-widest uppercase">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all sidebar-item ${
                activeSection === s.key
                  ? "active text-[#d4a853] bg-[#d4a853]/5"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">{s.emoji}</span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{s.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a1a1a]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white text-xl">
              ☰
            </button>
            <div>
              <h1 className="text-white font-bold text-lg capitalize">{activeSection}</h1>
              <p className="text-gray-500 text-xs">Welcome back, {adminUser}</p>
            </div>
          </div>
          <a href="/" target="_blank" className="text-gray-400 hover:text-[#d4a853] text-sm transition-colors">
            🌐 View Website
          </a>
        </header>

        <div className="p-6">
          {activeSection === "dashboard" && <DashboardSection data={dashData} />}
          {activeSection === "foods" && (
            <FoodsSection
              foods={foodsList}
              categories={categoriesList}
              onRefresh={() => fetchData("foods")}
              showModal={showFoodModal}
              setShowModal={setShowFoodModal}
              editingFood={editingFood}
              setEditingFood={setEditingFood}
            />
          )}
          {activeSection === "categories" && (
            <CategoriesSection
              categories={categoriesList}
              onRefresh={() => fetchData("categories")}
              showModal={showCategoryModal}
              setShowModal={setShowCategoryModal}
            />
          )}
          {activeSection === "orders" && (
            <OrdersSection orders={ordersList} onRefresh={() => fetchData("orders")} />
          )}
          {activeSection === "coupons" && (
            <CouponsSection
              coupons={couponsList}
              onRefresh={() => fetchData("coupons")}
              showModal={showCouponModal}
              setShowModal={setShowCouponModal}
            />
          )}
          {activeSection === "customers" && (
            <CustomersSection customers={customersList} onRefresh={() => fetchData("customers")} />
          )}
          {activeSection === "settings" && (
            <SettingsSection data={settingsData} onRefresh={() => fetchData("settings")} />
          )}
        </div>
      </main>
    </div>
  );
}

// ========== Dashboard Section ==========
function DashboardSection({ data }: { data: DashboardData | null }) {
  if (!data) return <LoadingSpinner />;

  const stats = [
    { label: "Total Orders", value: data.totalOrders, emoji: "📦", color: "from-blue-500 to-blue-600" },
    { label: "Today's Orders", value: data.todayOrders, emoji: "📋", color: "from-green-500 to-green-600" },
    { label: "Revenue", value: `₹${data.totalRevenue.toLocaleString()}`, emoji: "💰", color: "from-[#d4a853] to-[#b8922e]" },
    { label: "Pending", value: data.pendingOrders, emoji: "⏳", color: "from-yellow-500 to-yellow-600" },
    { label: "Completed", value: data.completedOrders, emoji: "✅", color: "from-emerald-500 to-emerald-600" },
    { label: "Cancelled", value: data.cancelledOrders, emoji: "❌", color: "from-red-500 to-red-600" },
    { label: "Customers", value: data.activeCustomers, emoji: "👥", color: "from-purple-500 to-purple-600" },
    { label: "Menu Items", value: data.totalFoods, emoji: "🍕", color: "from-orange-500 to-orange-600" },
  ];

  const maxRevenue = Math.max(...data.monthlyData.map(d => d.revenue), 1);

  return (
    <div className="space-y-8 fade-in-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 card-3d">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.emoji}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${s.color} flex items-center justify-center opacity-20`} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <h3 className="text-white font-bold mb-6">Monthly Revenue</h3>
        <div className="flex items-end gap-2 h-48">
          {data.monthlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">
                {d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(1)}k` : ""}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#d4a853] to-[#f0d68a] transition-all duration-700 min-h-[4px]"
                style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` }}
              />
              <span className="text-[10px] text-gray-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order chart */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <h3 className="text-white font-bold mb-6">Monthly Orders</h3>
        <div className="flex items-end gap-2 h-48">
          {data.monthlyData.map((d, i) => {
            const maxOrders = Math.max(...data.monthlyData.map(x => x.orders), 1);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{d.orders > 0 ? d.orders : ""}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700 min-h-[4px]"
                  style={{ height: `${Math.max((d.orders / maxOrders) * 100, 2)}%` }}
                />
                <span className="text-[10px] text-gray-500">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== Foods Section ==========
function FoodsSection({
  foods, categories, onRefresh, showModal, setShowModal, editingFood, setEditingFood,
}: {
  foods: FoodItem[];
  categories: CategoryItem[];
  onRefresh: () => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  editingFood: FoodItem | null;
  setEditingFood: (v: FoodItem | null) => void;
}) {
  const [form, setForm] = useState({
    name: "", description: "", price: "", discountPrice: "", categoryId: "",
    isVeg: true, isBestseller: false, isNew: false, isOutOfStock: false, prepTime: "20 min",
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (editingFood) {
      setForm({
        name: editingFood.name,
        description: editingFood.description || "",
        price: String(editingFood.price),
        discountPrice: editingFood.discountPrice ? String(editingFood.discountPrice) : "",
        categoryId: String(editingFood.categoryId),
        isVeg: editingFood.isVeg,
        isBestseller: editingFood.isBestseller,
        isNew: editingFood.isNew,
        isOutOfStock: editingFood.isOutOfStock,
        prepTime: editingFood.prepTime || "20 min",
      });
      setShowModal(true);
    }
  }, [editingFood, setShowModal]);

  const handleSubmit = async () => {
    const body = {
      ...form,
      price: parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      categoryId: parseInt(form.categoryId),
      ...(editingFood ? { id: editingFood.id } : {}),
    };

    await fetch("/api/admin/foods", {
      method: editingFood ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setShowModal(false);
    setEditingFood(null);
    setForm({ name: "", description: "", price: "", discountPrice: "", categoryId: "", isVeg: true, isBestseller: false, isNew: false, isOutOfStock: false, prepTime: "20 min" });
    onRefresh();
  };

  const deleteFood = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/admin/foods?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const filtered = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search foods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#2a2a2a] rounded-xl text-white text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>
        <button
          onClick={() => { setEditingFood(null); setForm({ name: "", description: "", price: "", discountPrice: "", categoryId: categories[0]?.id ? String(categories[0].id) : "", isVeg: true, isBestseller: false, isNew: false, isOutOfStock: false, prepTime: "20 min" }); setShowModal(true); }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-semibold text-sm hover:shadow-lg transition-all btn-ripple"
        >
          + Add Food
        </button>
      </div>

      <div className="grid gap-3">
        {filtered.map(food => (
          <div key={food.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-2xl flex-shrink-0">
              {food.isVeg ? "🟢" : "🔴"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-white font-semibold text-sm">{food.name}</h4>
                {food.isBestseller && <span className="text-[10px] bg-[#d4a853]/20 text-[#d4a853] px-2 py-0.5 rounded-full">Bestseller</span>}
                {food.isNew && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>}
                {food.isOutOfStock && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Out of Stock</span>}
              </div>
              <p className="text-gray-500 text-xs mt-1">
                ₹{food.price} {food.discountPrice ? `→ ₹${food.discountPrice}` : ""} | {categories.find(c => c.id === food.categoryId)?.name || "—"}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditingFood(food)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors">
                Edit
              </button>
              <button onClick={() => deleteFood(food.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Food Modal */}
      {showModal && (
        <Modal title={editingFood ? "Edit Food" : "Add Food"} onClose={() => { setShowModal(false); setEditingFood(null); }}>
          <div className="space-y-4">
            <InputField label="Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <InputField label="Description" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} textarea />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Price (₹)" value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} type="number" />
              <InputField label="Discount Price (₹)" value={form.discountPrice} onChange={v => setForm(p => ({ ...p, discountPrice: v }))} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm"
                >
                  <option value="">Select</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <InputField label="Prep Time" value={form.prepTime} onChange={v => setForm(p => ({ ...p, prepTime: v }))} />
            </div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Veg" checked={form.isVeg} onChange={v => setForm(p => ({ ...p, isVeg: v }))} />
              <Toggle label="Bestseller" checked={form.isBestseller} onChange={v => setForm(p => ({ ...p, isBestseller: v }))} />
              <Toggle label="New" checked={form.isNew} onChange={v => setForm(p => ({ ...p, isNew: v }))} />
              <Toggle label="Out of Stock" checked={form.isOutOfStock} onChange={v => setForm(p => ({ ...p, isOutOfStock: v }))} />
            </div>
            <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold btn-ripple">
              {editingFood ? "Update Food" : "Add Food"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ========== Categories Section ==========
function CategoriesSection({ categories, onRefresh, showModal, setShowModal }: {
  categories: CategoryItem[];
  onRefresh: () => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!name) return;
    await fetch("/api/admin/categories", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { id: editId, name } : { name }),
    });
    setName("");
    setEditId(null);
    setShowModal(false);
    onRefresh();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">Categories ({categories.length})</h3>
        <button onClick={() => { setEditId(null); setName(""); setShowModal(true); }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-semibold text-sm btn-ripple">
          + Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 card-3d">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📂</span>
                <div>
                  <p className="text-white font-semibold">{cat.name}</p>
                  <p className="text-gray-500 text-xs">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditId(cat.id); setName(cat.name); setShowModal(true); }}
                  className="text-blue-400 text-xs hover:text-blue-300">Edit</button>
                <button onClick={() => deleteCategory(cat.id)} className="text-red-400 text-xs hover:text-red-300">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editId ? "Edit Category" : "Add Category"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <InputField label="Category Name" value={name} onChange={setName} />
            <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold btn-ripple">
              {editId ? "Update" : "Add"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ========== Orders Section ==========
function OrdersSection({ orders, onRefresh }: { orders: OrderItem[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o => {
    const statusMatch = filter === "all" || o.status === filter;
    const searchMatch = !search || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    onRefresh();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    preparing: "bg-blue-500/20 text-blue-400",
    "out for delivery": "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#2a2a2a] rounded-xl text-white text-sm" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "preparing", "out for delivery", "delivered", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === s ? "bg-[#d4a853]/20 text-[#d4a853]" : "bg-[#141414] text-gray-400 hover:text-white"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">#{order.orderId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">{order.customerName} • {order.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-[#d4a853] font-bold">₹{order.total}</p>
                <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-gray-400 text-xs mb-3">
              {order.items.map((item, i) => (
                <span key={i}>{item.name} ×{item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {["pending", "preparing", "out for delivery", "delivered", "cancelled"].map(s => (
                <button key={s} onClick={() => updateStatus(order.id, s)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium capitalize transition-colors ${
                    order.status === s ? "bg-[#d4a853] text-black" : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <span className="text-4xl block mb-2">📦</span>
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Coupons Section ==========
function CouponsSection({ coupons, onRefresh, showModal, setShowModal }: {
  coupons: CouponItem[];
  onRefresh: () => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", minOrder: "", maxDiscount: "", usageLimit: "100", expiryDate: "" });

  const handleSubmit = async () => {
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: parseFloat(form.value),
        minOrder: parseFloat(form.minOrder) || 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        usageLimit: parseInt(form.usageLimit),
        expiryDate: form.expiryDate || null,
      }),
    });
    setShowModal(false);
    setForm({ code: "", type: "percentage", value: "", minOrder: "", maxDiscount: "", usageLimit: "100", expiryDate: "" });
    onRefresh();
  };

  const toggleCoupon = async (coupon: CouponItem) => {
    await fetch("/api/admin/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
    });
    onRefresh();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">Coupons ({coupons.length})</h3>
        <button onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-semibold text-sm btn-ripple">
          + Create Coupon
        </button>
      </div>

      <div className="grid gap-3">
        {coupons.map(c => (
          <div key={c.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a853]/20 to-[#d4a853]/5 flex items-center justify-center text-xl">🎟️</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm font-mono">{c.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {c.isActive ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`} | Min: ₹{c.minOrder} | Used: {c.usedCount}/{c.usageLimit}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleCoupon(c)} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
                {c.isActive ? "Disable" : "Enable"}
              </button>
              <button onClick={() => deleteCoupon(c.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Create Coupon" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <InputField label="Coupon Code" value={form.code} onChange={v => setForm(p => ({ ...p, code: v }))} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm">
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <InputField label="Value" value={form.value} onChange={v => setForm(p => ({ ...p, value: v }))} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Min Order (₹)" value={form.minOrder} onChange={v => setForm(p => ({ ...p, minOrder: v }))} type="number" />
              <InputField label="Max Discount (₹)" value={form.maxDiscount} onChange={v => setForm(p => ({ ...p, maxDiscount: v }))} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Usage Limit" value={form.usageLimit} onChange={v => setForm(p => ({ ...p, usageLimit: v }))} type="number" />
              <InputField label="Expiry Date" value={form.expiryDate} onChange={v => setForm(p => ({ ...p, expiryDate: v }))} type="date" />
            </div>
            <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold btn-ripple">
              Create Coupon
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ========== Customers Section ==========
function CustomersSection({ customers, onRefresh }: { customers: CustomerItem[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");

  const toggleBlock = async (customer: CustomerItem) => {
    await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id, isBlocked: !customer.isBlocked }),
    });
    onRefresh();
  };

  const deleteCustomer = async (id: number) => {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/admin/customers?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 fade-in-up">
      <div className="relative max-w-md">
        <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#2a2a2a] rounded-xl text-white text-sm" />
        <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
      </div>

      <div className="grid gap-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a853] to-[#b8922e] flex items-center justify-center text-black font-bold text-lg">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                {c.isBlocked && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Blocked</span>}
              </div>
              <p className="text-gray-500 text-xs truncate">{c.email} {c.phone ? `• ${c.phone}` : ""}</p>
              <p className="text-gray-600 text-xs">Loyalty: {c.loyaltyPoints} pts • Joined: {new Date(c.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => toggleBlock(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${c.isBlocked ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                {c.isBlocked ? "Unblock" : "Block"}
              </button>
              <button onClick={() => deleteCustomer(c.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <span className="text-4xl block mb-2">👥</span>
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Settings Section ==========
function SettingsSection({ data, onRefresh }: { data: Record<string, string>; onRefresh: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(data); }, [data]);

  const handleSave = async () => {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onRefresh();
  };

  const fields = [
    { key: "restaurant_name", label: "Restaurant Name", emoji: "🍽️" },
    { key: "restaurant_tagline", label: "Tagline", emoji: "✨" },
    { key: "restaurant_phone", label: "Phone", emoji: "📞" },
    { key: "restaurant_email", label: "Email", emoji: "📧" },
    { key: "restaurant_address", label: "Address", emoji: "📍" },
    { key: "opening_hours", label: "Opening Hours", emoji: "🕐" },
    { key: "closing_hours", label: "Closing Hours", emoji: "🕐" },
    { key: "delivery_charge", label: "Delivery Charge (₹)", emoji: "🚚" },
    { key: "min_order", label: "Minimum Order (₹)", emoji: "💰" },
    { key: "gst_percentage", label: "GST %", emoji: "📋" },
    { key: "whatsapp_number", label: "WhatsApp Number", emoji: "💬" },
    { key: "upi_id", label: "UPI ID", emoji: "💳" },
    { key: "account_holder", label: "Account Holder", emoji: "👤" },
  ];

  return (
    <div className="space-y-6 fade-in-up max-w-2xl">
      <h3 className="text-white font-bold">Restaurant Settings</h3>

      {saved && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm text-center">
          ✅ Settings saved successfully!
        </div>
      )}

      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.key} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <label className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <span>{f.emoji}</span> {f.label}
            </label>
            <input
              type="text"
              value={form[f.key] || ""}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm"
            />
          </div>
        ))}
      </div>

      <button onClick={handleSave}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold text-base btn-ripple hover:shadow-2xl hover:shadow-[#d4a853]/30 transition-all">
        Save Settings
      </button>
    </div>
  );
}

// ========== Shared Components ==========

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", textarea = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm min-h-[80px]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm"
        />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-[#d4a853]" : "bg-[#2a2a2a]"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-gray-400 text-xs">{label}</span>
    </label>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-2 border-[#d4a853]/20 border-t-[#d4a853] rounded-full animate-spin" />
    </div>
  );
}
