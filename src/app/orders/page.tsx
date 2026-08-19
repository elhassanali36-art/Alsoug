"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatSDG } from "@/lib/utils";
import { Package, Truck, CheckCircle, XCircle, Clock, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: number; orderNumber: string; status: string; paymentStatus: string;
  paymentMethod: string; total: string; deliveryType: string; createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  processing: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  shipped: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
  delivered: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: "معلق",
  confirmed: "مؤكد",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
  refunded: "مسترد",
};

const PAYMENT_LABELS_AR: Record<string, string> = {
  bankak: "بنكك",
  ocash: "أوكاش",
  fawry: "فوري",
  mycashi: "ماي كاش",
  bank_transfer: "تحويل بنكي",
  cash_on_delivery: "الدفع عند الاستلام",
};

export default function OrdersPage() {
  const { lang, user } = useStore();
  const isAr = lang === "ar";
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch(`/api/orders?userId=${user.id}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false); });
  }, [user]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-500" />
          {isAr ? "طلباتي" : "My Orders"}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{isAr ? "لا توجد طلبات" : "No orders yet"}</h3>
            <Link href="/products" className="mt-4 inline-block bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold">
              {isAr ? "تسوق الآن" : "Shop Now"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">{order.orderNumber}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status] || "text-gray-600 bg-gray-100")}>
                        {isAr ? STATUS_LABELS_AR[order.status] : order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-SD" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatSDG(parseFloat(order.total))}</p>
                    <p className="text-xs text-gray-500">{isAr ? PAYMENT_LABELS_AR[order.paymentMethod] : order.paymentMethod}</p>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {["pending", "confirmed", "processing", "shipped", "delivered"].map((s, i) => {
                    const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
                    const currentIdx = statuses.indexOf(order.status);
                    const isDone = i <= currentIdx && order.status !== "cancelled";
                    return (
                      <div key={s} className="flex items-center gap-1 flex-shrink-0">
                        <div className={cn("w-2 h-2 rounded-full", isDone ? "bg-amber-500" : "bg-gray-200 dark:bg-gray-700")} />
                        {i < 4 && <div className={cn("w-8 h-0.5", isDone && i < currentIdx ? "bg-amber-500" : "bg-gray-200 dark:bg-gray-700")} />}
                      </div>
                    );
                  })}
                  <span className="text-xs text-gray-400 ms-2">
                    {isAr ? STATUS_LABELS_AR[order.status] : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
