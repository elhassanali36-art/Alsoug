"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { lang, setUser } = useStore();
  const isAr = lang === "ar";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        router.push("/");
      } else {
        setError(data.error || (isAr ? "فشل تسجيل الدخول" : "Login failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemo = async () => {
    setEmail("admin@souqaljumla.sd");
    setPassword("admin123");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-200 dark:shadow-amber-900/30">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isAr ? "مرحباً بك مجدداً" : "Welcome Back"}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{isAr ? "سجل دخولك للمتابعة" : "Sign in to continue"}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-200 dark:shadow-gray-900 p-8 border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-5 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {isAr ? "البريد الإلكتروني" : "Email"}
              </label>
              <div className="relative">
                <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isAr ? "right-3" : "left-3")} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn("w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors", isAr ? "pr-10 pl-3" : "pl-10 pr-3")}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isAr ? "right-3" : "left-3")} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={cn("w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors", isAr ? "pr-10 pl-10" : "pl-10 pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isAr ? "left-3" : "right-3")}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-200 dark:hover:shadow-amber-900/30"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleAdminDemo}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              {isAr ? "🔑 تجربة حساب المدير" : "🔑 Try Admin Demo"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isAr ? "ليس لديك حساب؟" : "Don't have an account?"}
              {" "}
              <Link href="/register" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                {isAr ? "إنشاء حساب" : "Register"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
