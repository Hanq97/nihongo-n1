"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const { hydrate, hydrated, currentUser } = useApp();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) router.replace("/login");
    else if (!currentUser.onboarded) router.replace("/onboarding");
    else router.replace("/dashboard");
  }, [hydrated, currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center jp-serif text-white text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, var(--accent), #8B5CF6)",
            boxShadow: "0 8px 24px rgba(124,92,255,0.4)",
          }}
        >
          道
        </div>
        <p className="text-muted">Đang tải Nihongo N1...</p>
      </div>
    </div>
  );
}
