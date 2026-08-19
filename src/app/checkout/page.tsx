"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatSDG, SUDANESE_STATES } from "@/lib/utils";
import {
  Truck, MapPin, Phone, User, CreditCard, CheckCircle,
  ChevronLeft, Loader2, Tag, Package, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PaymentMethod = {
  id: number; name: string; nameAr: string; code: string;
  accountNumber?: string | null; accountName?: string | null;
  instructions?: string | null; instructionsAr?: string | null;
};

const STEPS = ["العنوان", "الدفع", "تأكيد الطلب"];

export default function CheckoutPage() {
  const { lang, cart, user, clearCart, cartTotal } = useStore();
  const isAr = lang === "ar";
  const router = useRouter();
  const total = cartTotal();

  const [step, setStep] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [shippingFee, setShippingFee] = useState(1500);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [transactionNumber, setTransactionNumber] = useState("");

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    alternativePhone: "",
    state: "",
    city: "",
    detailedAddress: "",
    deliveryNotes: "",
  });

  const [deliveryType, setDeliveryType] = useState<"home_delivery" | "pickup">("home_delivery");

  useEffect(() => {
    fetch("/api/payment-methods")
      .then(r => r.json())
      .then(d => {
        setPaymentMethods(d.methods || []);
        if (d.methods?.[0]) setSelectedPayment(d.methods[0].code);
      });
  }, []);

  useEffect(() => {
    if (address.state && deliveryType === "home_delivery") {
      fetch(`/api/shipping?state=${address.state}`)
        .then(r => r.json())
        .then(d => { if (d.fee) setShippingFee(parseFloat(d.fee.fee)); });
    } else if (deliveryType === "pickup") {
      setShippingFee(0);
    }
  }, [address.state, deliveryType]);

  const applyCoupon = async () => {
    if (!couponCode) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, orderAmount: total }),
    });
    const data = await res.json();
    if (data.valid) {
      setDiscount(data.discount);
      setCouponValid(true);
      setCouponMsg(isAr ? `✅ تم تطبيق الخصم: ${formatSDG(data.discount)}` : `✅ Discount applied: ${formatSDG(data.discount)}`);
    } else {
      setCouponValid(false);
      setDiscount(0);
      setCouponMsg(data.error || (isAr ? "كود غير صحيح" : "Invalid code"));
    }
  };

  const grandTotal = total + (deliveryType === "home_delivery" ? shippingFee : 0) - discount;

  const handleSubmit = async () => {
    if (!user) { router.push("/login"); return; }
    if (deliveryType === "home_delivery" && (!address.fullName || !address.phone || !address.state || !address.city || !address.detailedAddress)) {
      alert(isAr ? "يرجى تعبئة جميع بيانات العنوان" : "Please fill all address fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          address,
          paymentMethod: selectedPayment,
          deliveryType,
          couponCode: couponValid ? couponCode : null,
          items: cart.map(c => ({
            productId: c.productId,
            productName: c.nameAr,
            productImage: c.image,
            quantity: c.quantity,
            price: c.price,
            selectedSize: c.selectedSize,
            selectedColor: c.selectedColor,
          })),
          notes: address.deliveryNotes,
          transactionNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        setOrderSuccess({ orderNumber: data.orderNumber });
        setStep(3);
      } else {
        alert(data.error || (isAr ? "فشل إرسال الطلب" : "Failed to place order"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{isAr ? "السلة فارغة" : "Cart is empty"}</h2>
          <Link href="/products" className="mt-4 inline-block bg-amber-500 text-white px-6 py-3 rounded-xl font-bold">
            {isAr ? "تسوق الآن" : "Shop Now"}
          </Link>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isAr ? "تم استلام طلبك! 🎉" : "Order Placed! 🎉"}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{isAr ? "سنتواصل معك قريباً لتأكيد الطلب" : "We'll contact you soon to confirm your order"}</p>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{isAr ? "رقم الطلب" : "Order Number"}</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">{orderSuccess.orderNumber}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <Link href="/orders" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors">
              {isAr ? "تتبع الطلب" : "Track Order"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedMethod = paymentMethods.find(m => m.code === selectedPayment);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              )}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={cn("text-sm font-medium hidden sm:block", step === i + 1 ? "text-amber-600 dark:text-amber-400" : "text-gray-400")}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={cn("w-8 h-0.5 mx-1", step > i + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700")} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
            {step === 1 && (
              <>
                {/* Delivery Type */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-500" />
                    {isAr ? "طريقة التوصيل" : "Delivery Method"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "home_delivery", ar: "توصيل للمنزل", en: "Home Delivery", icon: "🏠" },
                      { value: "pickup", ar: "استلام من المخزن", en: "Store Pickup", icon: "🏪" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDeliveryType(opt.value as "home_delivery" | "pickup")}
                        className={cn(
                          "p-4 rounded-xl border-2 text-center transition-all",
                          deliveryType === opt.value
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                        )}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? opt.ar : opt.en}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address */}
                {deliveryType === "home_delivery" && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      {isAr ? "عنوان التوصيل" : "Delivery Address"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "fullName", ar: "الاسم الكامل", en: "Full Name", icon: <User className="w-4 h-4" /> },
                        { key: "phone", ar: "رقم الهاتف", en: "Phone Number", icon: <Phone className="w-4 h-4" /> },
                        { key: "alternativePhone", ar: "هاتف بديل (اختياري)", en: "Alternative Phone (Optional)", icon: <Phone className="w-4 h-4" /> },
                      ].map((field) => (
                        <div key={field.key} className={field.key === "fullName" ? "sm:col-span-2" : ""}>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{isAr ? field.ar : field.en}</label>
                          <div className="relative">
                            <span className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isAr ? "right-3" : "left-3")}>{field.icon}</span>
                            <input
                              type="text"
                              value={address[field.key as keyof typeof address]}
                              onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                              className={cn("w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors", isAr ? "pr-9 pl-3" : "pl-9 pr-3")}
                            />
                          </div>
                        </div>
                      ))}

                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{isAr ? "الولاية" : "State"}</label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="">{isAr ? "اختر الولاية" : "Select State"}</option>
                          {SUDANESE_STATES.map((s) => (
                            <option key={s.en} value={s.en}>{isAr ? s.ar : s.en}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{isAr ? "المدينة/الحي" : "City/District"}</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{isAr ? "العنوان التفصيلي" : "Detailed Address"}</label>
                        <textarea
                          value={address.detailedAddress}
                          onChange={(e) => setAddress({ ...address, detailedAddress: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{isAr ? "ملاحظات التوصيل (اختياري)" : "Delivery Notes (Optional)"}</label>
                        <textarea
                          value={address.deliveryNotes}
                          onChange={(e) => setAddress({ ...address, deliveryNotes: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                          placeholder={isAr ? "أي تعليمات خاصة للتوصيل..." : "Any special delivery instructions..."}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-2xl font-bold transition-colors"
                >
                  {isAr ? "التالي: طريقة الدفع" : "Next: Payment Method"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    {isAr ? "طريقة الدفع" : "Payment Method"}
                  </h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label key={method.code} className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedPayment === method.code
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                      )}>
                        <input
                          type="radio"
                          name="payment"
                          value={method.code}
                          checked={selectedPayment === method.code}
                          onChange={() => setSelectedPayment(method.code)}
                          className="accent-amber-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{isAr ? method.nameAr : method.name}</p>
                          {method.accountNumber && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{method.accountNumber}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Payment Instructions */}
                  {selectedMethod && selectedMethod.code !== "cash_on_delivery" && (
                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">{isAr ? "تعليمات الدفع:" : "Payment Instructions:"}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {isAr ? selectedMethod.instructionsAr : selectedMethod.instructions}
                      </p>
                      {selectedMethod.accountNumber && (
                        <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500">{isAr ? "رقم الحساب:" : "Account:"}</p>
                          <p className="font-mono font-bold text-gray-900 dark:text-white">{selectedMethod.accountNumber}</p>
                          {selectedMethod.accountName && <p className="text-xs text-gray-500">{selectedMethod.accountName}</p>}
                        </div>
                      )}
                      <div className="mt-3">
                        <label className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 block">
                          {isAr ? "رقم العملية / المرجع" : "Transaction Number / Reference"}
                        </label>
                        <input
                          type="text"
                          value={transactionNumber}
                          onChange={(e) => setTransactionNumber(e.target.value)}
                          placeholder={isAr ? "أدخل رقم العملية..." : "Enter transaction number..."}
                          className="w-full border border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {isAr ? "السابق" : "Back"}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {isAr ? "تأكيد الطلب" : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 sticky top-20">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                {isAr ? "ملخص الطلب" : "Order Summary"}
              </h3>

              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.nameAr}</p>
                      {item.selectedSize && <p className="text-xs text-gray-400">× {item.quantity}</p>}
                    </div>
                    <p className="text-sm font-bold text-amber-600 flex-shrink-0">{formatSDG(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {isAr ? "كود الخصم" : "Coupon Code"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={isAr ? "أدخل الكود..." : "Enter code..."}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    {isAr ? "تطبيق" : "Apply"}
                  </button>
                </div>
                {couponMsg && (
                  <p className={cn("text-xs mt-1", couponValid ? "text-green-600" : "text-red-500")}>{couponMsg}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatSDG(total)}</span>
                </div>
                {deliveryType === "home_delivery" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{isAr ? "رسوم الشحن" : "Shipping"}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {total >= 50000 ? (isAr ? "مجاني" : "Free") : formatSDG(shippingFee)}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">{isAr ? "الخصم" : "Discount"}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">-{formatSDG(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                  <span className="text-gray-900 dark:text-white">{isAr ? "الإجمالي" : "Total"}</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatSDG(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
