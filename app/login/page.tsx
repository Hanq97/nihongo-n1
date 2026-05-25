"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login, hydrate, hydrated, currentUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && currentUser) {
      router.replace(currentUser.onboarded ? "/dashboard" : "/onboarding");
    }
  }, [hydrated, currentUser, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Email không hợp lệ");
    if (password.length < 6) return setError("Mật khẩu cần ít nhất 6 ký tự");
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if ("error" in res) return setError(res.error);
    router.push(res.onboarded ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8 relative overflow-hidden">
      <div
        className="absolute right-[-200px] top-[-200px] jp-serif font-bold leading-none pointer-events-none select-none"
        style={{ fontSize: 600, color: "var(--accent-soft)" }}
      >
        道
      </div>
      <div className="bg-surface rounded-3xl shadow-elev p-8 sm:p-10 w-full max-w-md relative">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center jp-serif text-white text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, var(--accent), #8B5CF6)",
              boxShadow: "0 8px 24px rgba(124,92,255,0.4)",
            }}
          >
            道
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Nihongo N1</h1>
          <p className="text-sm text-muted mt-1">
            Đăng nhập để tiếp tục ôn thi · <span className="jp">頑張ろう</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoFocus
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-xs px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}
          <Button type="submit" size="xl" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-accent font-semibold">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
