"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CartItem {
  food: {
    id: number;
    name: string;
    price: number;
    discountPrice: number | null;
    categoryId: number;
  };
  quantity: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    deliveryInstructions: "",
    paymentMethod: "cod",
    transactionId: "",
  });

  useEffect(() => {
    const cartParam = searchParams.get("cart");
    if (cartParam) {
      try { setCart(JSON.parse(cartParam)); } catch { /* empty */ }
    } else {
      const saved = localStorage.getItem("fh_cart");
      if (saved) setCart(JSON.parse(saved));
    }

    // Load user data
    const user = localStorage.getItem("customer_user");
    if (user) {
      const u = JSON.parse(user);
      setForm(p => ({ ...p, name: u.name || "", email: u.email || "", phone: u.phone || "" }));
    }

    // Load settings
    fetch("/api/admin/settings").then(r => r.json()).then(setSettings).catch(() => {});
  }, [searchParams]);

  const subtotal = cart.reduce((s, i) => s + (i.food.discountPrice || i.food.price) * i.quantity, 0);
  const deliveryCharge = parseFloat(settings.delivery_charge || "40");
  const gstPercentage = parseFloat(settings.gst_percentage || "5");
  const gst = (subtotal * gstPercentage) / 100;
  const total = subtotal + deliveryCharge + gst - discount;

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discount);
        setCouponApplied(true);
      } else {
        setCouponError(data.error || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const user = localStorage.getItem("customer_user");
      const customerId = user ? JSON.parse(user).id : 0;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          address: `${form.address}, ${form.city}, ${form.state} - ${form.pinCode}`,
          items: cart.map(i => ({
            foodId: i.food.id,
            name: i.food.name,
            price: i.food.discountPrice || i.food.price,
            quantity: i.quantity,
          })),
          subtotal,
          deliveryCharge,
          gst,
          discount,
          total,
          couponCode: couponApplied ? couponCode : null,
          paymentMethod: form.paymentMethod,
          transactionId: form.transactionId || null,
          deliveryInstructions: form.deliveryInstructions || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderId(data.order.orderId);
        setOrderSuccess(true);
        localStorage.removeItem("fh_cart");

        // Open WhatsApp
        const whatsappNumber = settings.whatsapp_number || "919876543210";
        const items = cart.map(i => `• ${i.food.name} ×${i.quantity} = ₹${(i.food.discountPrice || i.food.price) * i.quantity}`).join("\n");
        const msg = `🍽️ *New Order - ${settings.restaurant_name || "Flavour House"}*\n\n📋 *Order ID:* ${data.order.orderId}\n👤 *Name:* ${form.name}\n📞 *Phone:* ${form.phone}\n📍 *Address:* ${form.address}, ${form.city}, ${form.state} - ${form.pinCode}\n\n🛒 *Items:*\n${items}\n\n💰 Subtotal: ₹${subtotal}\n🚚 Delivery: ₹${deliveryCharge}\n📋 GST: ₹${gst.toFixed(2)}\n🎟️ Discount: -₹${discount}\n*📦 Total: ₹${total.toFixed(2)}*\n\n💳 Payment: ${form.paymentMethod.toUpperCase()}\n${form.transactionId ? `🔑 Transaction ID: ${form.transactionId}` : ""}\n${form.deliveryInstructions ? `📝 Instructions: ${form.deliveryInstructions}` : ""}\n\n🕐 ${new Date().toLocaleString()}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
        window.open(whatsappUrl, "_blank");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-white text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items first!</p>
          <Link href="/" className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-semibold btn-ripple">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Order Confirmed!
          </h2>
          <p className="text-gray-400 mb-2">Your order has been placed successfully</p>
          <div className="glass rounded-2xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="text-[#d4a853] font-mono font-bold">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="text-white font-bold">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Est. Delivery</span>
              <span className="text-white">30-45 min</span>
            </div>
          </div>

          {/* Order tracking */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Order Status</h3>
            <div className="flex items-center justify-between">
              {["Ordered", "Preparing", "Cooking", "Packed", "Delivery", "Delivered"].map((s, i) => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#d4a853] text-black" : "bg-[#2a2a2a] text-gray-500"}`}>
                    {i + 1}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 text-center">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full w-[16%] bg-gradient-to-r from-[#d4a853] to-[#f0d68a] rounded-full transition-all duration-1000" />
            </div>
          </div>

          <Link href="/" className="px-8 py-4 rounded-full bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold inline-block btn-ripple">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-[#d4a853] text-2xl transition-colors">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Checkout</h1>
            <p className="text-gray-500 text-sm">Step {step} of 2</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#2a2a2a]">
              <div className={`h-full rounded-full transition-all duration-500 ${step >= s ? "bg-gradient-to-r from-[#d4a853] to-[#f0d68a] w-full" : "w-0"}`} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6 fade-in-up">
            {step === 1 && (
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">📍 Delivery Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Address</label>
                  <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm min-h-[80px]" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">City</label>
                    <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">State</label>
                    <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">PIN Code</label>
                    <input type="text" value={form.pinCode} onChange={e => setForm(p => ({ ...p, pinCode: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Delivery Instructions (Optional)</label>
                  <input type="text" value={form.deliveryInstructions} onChange={e => setForm(p => ({ ...p, deliveryInstructions: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm" placeholder="Ring the bell twice..." />
                </div>
                <button onClick={() => setStep(2)} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold btn-ripple">
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">💳 Payment Method</h3>
                {[
                  { key: "cod", label: "Cash on Delivery", emoji: "💵", desc: "Pay when you receive" },
                  { key: "upi", label: "UPI Payment", emoji: "📱", desc: "Pay via UPI apps" },
                  { key: "qr", label: "QR Code Payment", emoji: "📸", desc: "Scan & pay" },
                ].map(pm => (
                  <button
                    key={pm.key}
                    onClick={() => setForm(p => ({ ...p, paymentMethod: pm.key }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      form.paymentMethod === pm.key
                        ? "border-[#d4a853] bg-[#d4a853]/5"
                        : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#d4a853]/50"
                    }`}
                  >
                    <span className="text-2xl">{pm.emoji}</span>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">{pm.label}</p>
                      <p className="text-gray-500 text-xs">{pm.desc}</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.paymentMethod === pm.key ? "border-[#d4a853]" : "border-[#2a2a2a]"
                      }`}>
                        {form.paymentMethod === pm.key && <div className="w-3 h-3 rounded-full bg-[#d4a853]" />}
                      </div>
                    </div>
                  </button>
                ))}

                {(form.paymentMethod === "upi" || form.paymentMethod === "qr") && (
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
                    {form.paymentMethod === "qr" && settings.upi_id && (
                      <div className="text-center">
                        <p className="text-gray-400 text-sm mb-2">Scan QR or pay to:</p>
                        <p className="text-[#d4a853] font-mono font-bold text-lg">{settings.upi_id}</p>
                        <p className="text-gray-500 text-xs mt-1">{settings.account_holder}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Transaction ID / UTR</label>
                      <input type="text" value={form.transactionId} onChange={e => setForm(p => ({ ...p, transactionId: e.target.value }))} className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white text-sm" placeholder="Enter transaction ID" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border border-[#2a2a2a] text-gray-400 font-semibold hover:text-white transition-colors">
                    ← Back
                  </button>
                  <button onClick={placeOrder} disabled={loading} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-black font-bold btn-ripple disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Placing...
                      </span>
                    ) : (
                      `Place Order • ₹${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 sticky top-4">
              <h3 className="text-white font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.food.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.food.name} ×{item.quantity}</span>
                    <span className="text-white">₹{((item.food.discountPrice || item.food.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {!couponApplied && (
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm" />
                  <button onClick={applyCoupon} className="px-4 py-2 rounded-lg bg-[#d4a853]/20 text-[#d4a853] text-sm font-semibold hover:bg-[#d4a853]/30 transition-colors">Apply</button>
                </div>
              )}
              {couponError && <p className="text-red-400 text-xs mb-2">{couponError}</p>}
              {couponApplied && <p className="text-green-400 text-xs mb-2">✅ Coupon applied! -₹{discount.toFixed(2)}</p>}

              <div className="border-t border-[#2a2a2a] pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-white">₹{deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST ({gstPercentage}%)</span>
                  <span className="text-white">₹{gst.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#2a2a2a] pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#d4a853] font-bold text-xl">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#d4a853]/20 border-t-[#d4a853] rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
