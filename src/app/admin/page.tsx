"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { formatSDG } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingBag, Users, CreditCard,
  TrendingUp, CheckCircle, Clock, AlertCircle, RefreshCw,
  Store, Settings, BarChart3, Edit, Trash2, Eye, Loader2, X, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

type Stats = {
  totalOrders: number; totalRevenue: number; totalUsers: number; totalProducts: number;
  pendingOrders: number; pendingPayments: number; recentOrders: Order[];
};

type Order = {
  id: number; orderNumber: string; status: string; paymentStatus: string;
  paymentMethod: string; total: string; createdAt: string;
  userName?: string; userPhone?: string; userEmail?: string;
  transactionNumber?: string; adminNotes?: string;
};

type Product = {
  id: number; nameAr: string; nameEn?: string; slug: string;
  originalPrice: string; discountPrice?: string; stock: number;
  isActive: boolean; isFeatured?: boolean; isFlashDeal?: boolean;
  rating?: string; reviewCount?: number; soldCount?: number;
  images?: string[]; categoryNameAr?: string; brandNameEn?: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  confirmed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  processing: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  shipped: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
  delivered: "text-green-600 bg-green-50 dark:bg-green-900/20",
  cancelled: "text-red-600 bg-red-50 dark:bg-red-900/20",
  pending_verification: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  verified: "text-green-600 bg-green-50 dark:bg-green-900/20",
  failed: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

const STATUS_AR: Record<string, string> = {
  pending: "معلق", confirmed: "مؤكد", processing: "قيد المعالجة",
  shipped: "مشحون", delivered: "تم التوصيل", cancelled: "ملغي",
  pending_verification: "بانتظار التحقق", verified: "محقق", failed: "فشل", refunded: "مسترد",
};

type TabType = "dashboard" | "orders" | "products" | "settings";

export default function AdminPage() {
  const { lang, user } = useStore();
  const isAr = lang === "ar";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "seller")) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/orders").then(r => r.json()),
        fetch("/api/admin/products").then(r => r.json()),
      ]);
      setStats(statsRes);
      setOrders(ordersRes.orders || []);
      setProducts(productsRes.products || []);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: number, updates: Partial<Order>) => {
    setUpdatingOrder(true);
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, ...updates });
    } finally {
      setUpdatingOrder(false);
    }
  };

  const toggleProduct = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    setProducts(products.map(p => p.id === id ? { ...p, isActive: !isActive } : p));
  };

  if (!user || (user.role !== "admin" && user.role !== "seller")) return null;

  const SIDEBAR_ITEMS = [
    { key: "dashboard" as TabType, ar: "لوحة التحكم", en: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: "orders" as TabType, ar: "الطلبات", en: "Orders", icon: <ShoppingBag className="w-5 h-5" />, badge: stats?.pendingOrders },
    { key: "products" as TabType, ar: "المنتجات", en: "Products", icon: <Package className="w-5 h-5" /> },
    { key: "settings" as TabType, ar: "الإعدادات", en: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex" dir={isAr ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 min-h-screen">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-400 text-sm">سوق الجملة</p>
              <p className="text-xs text-gray-400">{user.role === "admin" ? "المدير" : "البائع"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === item.key
                  ? "bg-amber-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {item.icon}
              <span>{isAr ? item.ar : item.en}</span>
              {item.badge && item.badge > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => router.push("/")} className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2">
            <Eye className="w-4 h-4" /> {isAr ? "عرض الموقع" : "View Site"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {SIDEBAR_ITEMS.find(i => i.key === activeTab)?.[isAr ? "ar" : "en"]}
            </h1>
            <button onClick={loadData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              {isAr ? "تحديث" : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === "dashboard" && stats && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: isAr ? "إجمالي المبيعات" : "Total Revenue", value: formatSDG(stats.totalRevenue), icon: <TrendingUp className="w-6 h-6" />, color: "from-amber-500 to-amber-600", sub: isAr ? "الدفعات المحققة" : "Verified payments" },
                      { label: isAr ? "إجمالي الطلبات" : "Total Orders", value: stats.totalOrders, icon: <ShoppingBag className="w-6 h-6" />, color: "from-blue-500 to-blue-600", sub: `${stats.pendingOrders} ${isAr ? "معلق" : "pending"}` },
                      { label: isAr ? "العملاء" : "Customers", value: stats.totalUsers, icon: <Users className="w-6 h-6" />, color: "from-green-500 to-green-600", sub: isAr ? "مسجل" : "registered" },
                      { label: isAr ? "المنتجات" : "Products", value: stats.totalProducts, icon: <Package className="w-6 h-6" />, color: "from-purple-500 to-purple-600", sub: isAr ? "نشط" : "active" },
                    ].map((card, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3", card.color)}>
                          {card.icon}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Alert Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex items-center gap-4">
                      <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-orange-700 dark:text-orange-400">{stats.pendingPayments} {isAr ? "دفعة بانتظار التحقق" : "Payments Pending Verification"}</p>
                        <button onClick={() => setActiveTab("orders")} className="text-sm text-orange-600 hover:underline">{isAr ? "مراجعة الآن" : "Review Now"}</button>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-4">
                      <Clock className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-blue-700 dark:text-blue-400">{stats.pendingOrders} {isAr ? "طلب معلق" : "Pending Orders"}</p>
                        <button onClick={() => setActiveTab("orders")} className="text-sm text-blue-600 hover:underline">{isAr ? "معالجة الآن" : "Process Now"}</button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white">{isAr ? "آخر الطلبات" : "Recent Orders"}</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {stats.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div>
                            <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString(isAr ? "ar-SD" : "en")}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status] || "text-gray-500")}>
                              {isAr ? STATUS_AR[order.status] : order.status}
                            </span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{formatSDG(parseFloat(order.total))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">{isAr ? `${orders.length} طلب` : `${orders.length} orders`}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {[
                            { ar: "رقم الطلب", en: "Order #" },
                            { ar: "العميل", en: "Customer" },
                            { ar: "الحالة", en: "Status" },
                            { ar: "الدفع", en: "Payment" },
                            { ar: "الإجمالي", en: "Total" },
                            { ar: "التاريخ", en: "Date" },
                            { ar: "إجراء", en: "Action" },
                          ].map((h) => (
                            <th key={h.ar} className={cn("px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                              {isAr ? h.ar : h.en}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{order.orderNumber}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-white text-xs">{order.userName || "-"}</p>
                              <p className="text-gray-400 text-xs">{order.userPhone || order.userEmail}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status] || "text-gray-500")}>
                                {isAr ? STATUS_AR[order.status] : order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.paymentStatus] || "text-gray-500")}>
                                {isAr ? STATUS_AR[order.paymentStatus] : order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              {formatSDG(parseFloat(order.total))}
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-SD" : "en")}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-amber-600 hover:text-amber-700 dark:text-amber-400 text-xs flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                {isAr ? "إدارة" : "Manage"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Products */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push("/admin/add-product")}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {isAr ? "إضافة منتج" : "Add Product"}
                    </button>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {[
                              { ar: "المنتج", en: "Product" },
                              { ar: "السعر", en: "Price" },
                              { ar: "المخزون", en: "Stock" },
                              { ar: "المبيعات", en: "Sold" },
                              { ar: "التقييم", en: "Rating" },
                              { ar: "الحالة", en: "Status" },
                              { ar: "إجراء", en: "Action" },
                            ].map((h) => (
                              <th key={h.ar} className={cn("px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                                {isAr ? h.ar : h.en}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                    {product.images?.[0] && (
                                      <img src={product.images[0]} alt={product.nameAr} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-xs line-clamp-1">{product.nameAr}</p>
                                    <p className="text-gray-400 text-xs">{product.categoryNameAr}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold text-xs whitespace-nowrap">
                                {formatSDG(parseFloat(product.originalPrice))}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={cn("text-xs font-medium", product.stock < 5 ? "text-red-500" : product.stock < 20 ? "text-yellow-600" : "text-green-600")}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{product.soldCount || 0}</td>
                              <td className="px-4 py-3 text-xs">
                                <span className="text-amber-500">★</span> {product.rating || "0"}
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", product.isActive ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400")}>
                                  {product.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => router.push(`/product/${product.slug}`)}
                                    className="text-gray-400 hover:text-amber-600 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleProduct(product.id, product.isActive)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              {activeTab === "settings" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">{isAr ? "إعدادات العملة" : "Currency Settings"}</h3>
                    <div className="space-y-3">
                      {[
                        { label: isAr ? "سعر الدولار (USD) مقابل الجنيه السوداني" : "USD to SDG Rate", key: "exchange_rate_usd" },
                        { label: isAr ? "سعر الريال (SAR) مقابل الجنيه السوداني" : "SAR to SDG Rate", key: "exchange_rate_sar" },
                        { label: isAr ? "حد الشحن المجاني (جنيه)" : "Free Shipping Threshold (SDG)", key: "free_shipping_threshold" },
                      ].map((setting) => (
                        <div key={setting.key}>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{setting.label}</label>
                          <input
                            type="number"
                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                            placeholder="..."
                          />
                        </div>
                      ))}
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                        {isAr ? "حفظ الإعدادات" : "Save Settings"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">{isAr ? "إحصائيات سريعة" : "Quick Stats"}</h3>
                    <div className="space-y-3">
                      {stats && [
                        { ar: "إجمالي الطلبات", en: "Total Orders", val: stats.totalOrders },
                        { ar: "الطلبات المعلقة", en: "Pending Orders", val: stats.pendingOrders },
                        { ar: "دفعات بانتظار التحقق", en: "Pending Payments", val: stats.pendingPayments },
                        { ar: "إجمالي العملاء", en: "Total Customers", val: stats.totalUsers },
                        { ar: "إجمالي المنتجات", en: "Total Products", val: stats.totalProducts },
                        { ar: "إجمالي الإيرادات", en: "Total Revenue", val: formatSDG(stats.totalRevenue) },
                      ].map((item) => (
                        <div key={item.ar} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{isAr ? item.ar : item.en}</span>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir={isAr ? "rtl" : "ltr"}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{isAr ? "إدارة الطلب" : "Manage Order"}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{selectedOrder.orderNumber}</p>
                <p className="text-xs text-gray-500">{selectedOrder.userName} - {selectedOrder.userPhone || selectedOrder.userEmail}</p>
                {selectedOrder.transactionNumber && (
                  <p className="text-xs text-amber-600 mt-1">{isAr ? "رقم العملية:" : "Transaction:"} {selectedOrder.transactionNumber}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">{isAr ? "حالة الطلب" : "Order Status"}</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                >
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                    <option key={s} value={s}>{isAr ? STATUS_AR[s] : s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">{isAr ? "حالة الدفع" : "Payment Status"}</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, paymentStatus: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                >
                  {["pending", "pending_verification", "verified", "failed"].map((s) => (
                    <option key={s} value={s}>{isAr ? STATUS_AR[s] : s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">{isAr ? "ملاحظات الإدارة" : "Admin Notes"}</label>
                <textarea
                  value={selectedOrder.adminNotes || ""}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, adminNotes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                onClick={() => { updateOrder(selectedOrder.id, { status: selectedOrder.status as Order["status"], paymentStatus: selectedOrder.paymentStatus as Order["paymentStatus"], adminNotes: selectedOrder.adminNotes }); setSelectedOrder(null); }}
                disabled={updatingOrder}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {updatingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAr ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
