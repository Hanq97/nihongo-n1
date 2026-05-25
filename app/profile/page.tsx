"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/lib/store";
import { storage } from "@/lib/storage";
import { getStreak } from "@/lib/srs-helpers";
import { formatDateVi } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateUser, logout, syncSeedData, forceReloadBulk } = useApp();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [goal, setGoal] = useState(20);
  const [stats, setStats] = useState({
    reviewed: 0,
    learned: 0,
    accuracy: 0,
    streak: 0,
    longest: 0,
  });

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.display_name);
    setExamDate(currentUser.target_exam_date);
    setGoal(currentUser.daily_goal);

    const logs = storage.getReviewLogs().filter((l) => l.user_id === currentUser.id);
    const attempts = storage.getQuizAttempts().filter((a) => a.user_id === currentUser.id);
    const states = storage.getCardStates().filter((s) => s.user_id === currentUser.id);

    const reviewed = logs.length;
    const learned = states.filter((s) => s.state !== "new").length;
    const correct = attempts.filter((a) => a.is_correct).length;
    const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
    const streak = getStreak(currentUser.id);

    // longest streak (scan back 365 days)
    const dayKeys = new Set<string>();
    logs.forEach((l) => {
      const d = new Date(l.reviewed_at);
      dayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    let longest = 0;
    let cur = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dayKeys.has(k)) {
        cur++;
        longest = Math.max(longest, cur);
      } else cur = 0;
    }

    setStats({ reviewed, learned, accuracy, streak, longest });
  }, [currentUser]);

  if (!currentUser) return <AppShell>{null}</AppShell>;

  function save() {
    updateUser({ display_name: name, target_exam_date: examDate, daily_goal: goal });
    setEditing(false);
  }

  function handleSync() {
    if (!currentUser) return;
    const res = syncSeedData(currentUser.id);
    const total = res.kanji + res.vocab + res.grammar;
    if (total === 0) {
      setSyncMsg("Deck mặc định đã đầy đủ — không có gì để thêm.");
    } else {
      setSyncMsg(
        `✓ Đã thêm ${res.kanji} kanji, ${res.vocab} vocab, ${res.grammar} grammar vào deck mặc định.`
      );
    }
    setTimeout(() => setSyncMsg(null), 4000);
  }

  async function handleForceReloadBulk() {
    setBulkLoading(true);
    setSyncMsg("Đang tải bulk data...");
    try {
      const res = await forceReloadBulk();
      const total = res.kanji + res.vocab + res.grammar;
      if (total === 0) {
        setSyncMsg("Đã tải lại — không có item mới (toàn bộ đã có trong storage).");
      } else {
        setSyncMsg(
          `✓ Đã thêm ${res.kanji} kanji, ${res.vocab} vocab, ${res.grammar} grammar vào Extended decks.`
        );
      }
    } catch (e: any) {
      setSyncMsg(`✗ Lỗi: ${e.message}`);
    }
    setBulkLoading(false);
    setTimeout(() => setSyncMsg(null), 6000);
  }

  function handleLogout() {
    if (confirm("Đăng xuất khỏi tài khoản?")) {
      logout();
      router.push("/login");
    }
  }

  function handleClearAll() {
    if (
      confirm(
        "⚠️ Xóa TẤT CẢ dữ liệu (tài khoản, tiến độ, deck)? Hành động này KHÔNG THỂ hoàn tác."
      )
    ) {
      storage.clearAll();
      location.href = "/login";
    }
  }

  return (
    <AppShell>
      <div className="p-5 sm:p-7 max-w-5xl mx-auto pb-28 lg:pb-7">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
            <span className="jp">プロフィール</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1 tracking-tight">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card>
            <CardBody className="text-center p-6">
              <div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-4xl font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--accent), #8B5CF6)",
                  boxShadow: "0 8px 24px rgba(124,92,255,0.4)",
                }}
              >
                {currentUser.display_name.charAt(0).toUpperCase()}
              </div>
              {editing ? (
                <div className="mt-5 space-y-3 text-left">
                  <Input label="Tên hiển thị" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="Ngày dự thi" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                  <Input
                    label="Daily goal (thẻ/ngày)"
                    type="number"
                    min={1}
                    max={100}
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mt-3 text-ink tracking-tight">{currentUser.display_name}</h3>
                  <p className="text-sm text-muted">{currentUser.email}</p>
                  <div className="mt-5 space-y-2 text-sm text-left">
                    <Row label="Ngày dự thi" value={currentUser.target_exam_date ? formatDateVi(currentUser.target_exam_date) : "—"} />
                    <Row label="Daily goal" value={`${currentUser.daily_goal} thẻ/ngày`} />
                    <Row label="Tham gia" value={formatDateVi(currentUser.created_at)} />
                    <Row label="Streak" value={`🔥 ${stats.streak} ngày`} />
                    <Row label="Streak dài nhất" value={`${stats.longest} ngày`} />
                  </div>
                </>
              )}
              {editing ? (
                <div className="flex gap-2 mt-5">
                  <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)}>
                    Hủy
                  </Button>
                  <Button className="flex-1" onClick={save}>
                    Lưu
                  </Button>
                </div>
              ) : (
                <Button className="w-full mt-5" onClick={() => setEditing(true)}>
                  ✏️ Chỉnh sửa
                </Button>
              )}
            </CardBody>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardBody>
                <h3 className="font-bold text-ink mb-4">📊 Thống kê</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat value={stats.reviewed} label="Lượt ôn" />
                  <Stat value={stats.learned} label="Đã học" />
                  <Stat value={`${stats.accuracy}%`} label="Quiz đúng" />
                  <Stat value={stats.streak} label="🔥 Streak" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Button
                  variant="secondary"
                  className="w-full mb-2"
                  onClick={handleForceReloadBulk}
                  disabled={bulkLoading}
                >
                  📥 {bulkLoading ? "Đang tải..." : "Tải lại bulk data N1 (force)"}
                </Button>
                <Button variant="secondary" className="w-full mb-2" onClick={handleSync}>
                  🔄 Đồng bộ deck mặc định
                </Button>
                {syncMsg && (
                  <div className="text-xs text-success bg-success/10 border border-success/30 rounded p-2 mb-2">
                    {syncMsg}
                  </div>
                )}
                <Button variant="secondary" className="w-full mb-2" onClick={handleLogout}>
                  ⎋ Đăng xuất
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleClearAll}>
                  🗑 Xóa tất cả dữ liệu
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <strong className="text-right text-ink">{value}</strong>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center bg-surface-alt rounded-xl p-3">
      <div className="text-2xl font-extrabold text-accent tabular-nums">{value}</div>
      <div className="text-[11px] text-muted mt-0.5">{label}</div>
    </div>
  );
}
