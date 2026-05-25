"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { storage } from "@/lib/storage";
import { getStreak } from "@/lib/srs-helpers";
import { cn, daysBetween } from "@/lib/utils";
import { Icons } from "@/components/ui/Icon";

type NavItem = { href: string; label: string; jp: string; icon: React.ReactNode; badge?: number };

export function AppShell({ children, hideChrome = false }: { children: React.ReactNode; hideChrome?: boolean }) {
  const { currentUser, hydrate, hydrated, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [streak, setStreak] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    hydrate();
    // Restore theme
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("n1.theme") as "dark" | "light" | null;
      if (saved) {
        setTheme(saved);
        document.documentElement.classList.toggle("light", saved === "light");
      }
    }
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace("/login");
    } else if (!currentUser.onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [hydrated, currentUser, pathname, router]);

  useEffect(() => {
    if (!currentUser) return;
    setStreak(getStreak(currentUser.id));
    const now = new Date();
    const due = storage
      .getCardStates()
      .filter((s) => s.user_id === currentUser.id && new Date(s.due) <= now).length;
    setDueCount(due);
  }, [currentUser, pathname]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    localStorage.setItem("n1.theme", next);
  }

  if (!hydrated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Đang tải...</div>
      </div>
    );
  }

  const items: NavItem[] = [
    { href: "/dashboard", label: "Trang chủ", jp: "ホーム", icon: <Icons.Home /> },
    { href: "/learn", label: "Học hôm nay", jp: "今日の学習", icon: <Icons.Cards />, badge: dueCount || undefined },
    { href: "/quiz", label: "Quiz", jp: "クイズ", icon: <Icons.Quiz /> },
    { href: "/mock-test", label: "Đề thi thử", jp: "模試", icon: <Icons.Test /> },
    { href: "/decks", label: "Decks", jp: "デッキ", icon: <Icons.Trophy /> },
    { href: "/profile", label: "Cá nhân", jp: "プロフィール", icon: <Icons.User /> },
  ];

  const mobileNav = [items[0], items[1], items[2], items[3], items[5]];

  const daysToExam = currentUser.target_exam_date
    ? Math.max(0, daysBetween(new Date(), new Date(currentUser.target_exam_date)))
    : null;

  return (
    <div className="min-h-screen flex bg-bg text-ink">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 fixed h-screen bg-surface border-r border-[color:var(--border)] flex-col px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 mb-4">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-xl font-bold jp-serif shadow-[0_4px_12px_rgba(124,92,255,0.4)]"
            style={{ background: "linear-gradient(135deg, var(--accent), #8B5CF6)" }}
          >
            道
          </div>
          <div>
            <div className="font-bold text-sm text-ink tracking-tight">Nihongo N1</div>
            <div className="jp text-[10px] text-muted">日本語一級</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 text-sm">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors",
                  active ? "bg-accent-soft text-accent font-semibold" : "text-ink-soft hover:bg-surface-alt"
                )}
              >
                <span className="w-5 flex items-center justify-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "px-2 py-px rounded-full text-[11px] font-bold",
                      active ? "bg-accent text-white" : "bg-surface-alt text-muted"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Streak card */}
        <div className="mt-auto p-3.5 rounded-2xl bg-surface-alt">
          <div className="flex items-center gap-1.5 text-warning">
            <Icons.Flame size={20} />
            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Streak</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold tracking-tighter tabular-nums">{streak}</span>
            <span className="text-[11px] text-muted">ngày</span>
          </div>
          <div className="mt-1 text-[10px] text-muted leading-tight">Học mỗi ngày để giữ streak ✨</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Desktop topbar */}
        {!hideChrome && (
          <header className="hidden lg:flex sticky top-0 z-30 items-center gap-4 px-7 py-3 border-b border-[color:var(--border)] bg-bg/95 backdrop-blur">
            <div className="flex-1 relative max-w-md">
              <input
                placeholder="Tìm kanji, từ vựng hoặc ngữ pháp…"
                className="w-full bg-surface border border-[color:var(--border)] rounded-[10px] py-2.5 pl-9 pr-3 text-[13px] outline-none focus:border-accent transition-colors"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <Icons.Search />
              </div>
            </div>
            {daysToExam !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt text-[12px] text-ink-soft font-medium">
                <span className="text-accent">
                  <Icons.Clock />
                </span>
                Còn {daysToExam} ngày đến kỳ thi
              </div>
            )}
            <button
              onClick={toggleTheme}
              title="Đổi theme"
              className="w-9 h-9 rounded-full bg-surface border border-[color:var(--border)] flex items-center justify-center text-ink-soft hover:bg-surface-alt"
            >
              {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              title="Đăng xuất"
              className="w-9 h-9 rounded-full bg-surface border border-[color:var(--border)] flex items-center justify-center text-ink-soft hover:bg-surface-alt"
            >
              <Icons.Logout />
            </button>
            <div
              className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent), #8B5CF6)" }}
            >
              {currentUser.display_name.charAt(0).toUpperCase()}
            </div>
          </header>
        )}

        <div className="flex-1 min-h-0">{children}</div>
      </main>

      {/* Mobile floating pill bottom nav */}
      {!hideChrome && (
        <nav
          className="lg:hidden fixed left-3 right-3 bottom-3 z-40 rounded-[26px] px-1.5 py-2 flex justify-around items-center"
          style={{
            background: "var(--nav-bg)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {mobileNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 py-2 px-1 rounded-[20px] flex flex-col items-center gap-0.5 transition-all",
                  active ? "text-accent -translate-y-px" : "text-muted"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {active && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
                <span className={cn("text-[10.5px] tracking-[0.1px]", active ? "font-semibold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
