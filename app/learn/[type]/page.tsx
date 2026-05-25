"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flashcard } from "@/components/flashcard/Flashcard";
import { useApp } from "@/lib/store";

const VALID = new Set(["all", "kanji", "vocab", "grammar"]);

export default function LearnByTypePage() {
  const { currentUser, hydrate, hydrated } = useApp();
  const router = useRouter();
  const params = useParams<{ type: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (!currentUser.onboarded) {
      router.replace("/onboarding");
      return;
    }
    if (!VALID.has(params.type)) {
      router.replace("/learn");
      return;
    }
    setReady(true);
  }, [hydrated, currentUser, params.type, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Đang tải...
      </div>
    );
  }
  const typeFilter = params.type === "all" ? undefined : (params.type as "kanji" | "vocab" | "grammar");
  return <Flashcard typeFilter={typeFilter} />;
}
