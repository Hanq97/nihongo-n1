"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Email không hợp lệ");
    if (password.length < 6) return setError("Mật khẩu cần ít nhất 6 ký tự");
    if (password !== confirm) return setError("Mật khẩu xác nhận không khớp");
    const res = register(email, password, name);
    if ("error" in res) return setError(res.error);
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8 relative overflow-hidden">
      <div
        className="absolute right-[-200px] top-[-200px] jp-serif font-bold leading-none pointer-events-none select-none"
        style={{ fontSize: 600, color: "var(--accent-soft)" }}
      >
        始
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
          <h1 className="text-2xl font-bold text-ink tracking-tight">Tạo tài khoản</h1>
          <p className="text-sm text-muted mt-1">Bắt đầu hành trình N1 của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên hiển thị" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" autoFocus />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          <Input label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" />
          <Input label="Xác nhận mật khẩu" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-xs px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}
          <Button type="submit" size="xl" className="w-full">
            Đăng ký
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-accent font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
