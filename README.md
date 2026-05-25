# Nihongo N1 — Web App ôn thi JLPT N1

Web app responsive (mobile + desktop) cho ôn thi JLPT N1.

**Design v2** — dark mode mặc định với Inter + Noto Serif JP, sidebar có nhãn tiếng Nhật, hero card có 道 massive bg, palette indigo→violet, floating pill bottom nav trên mobile, dark/light theme toggle.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** với design tokens custom (Indigo primary)
- **Zustand** cho state management
- **ts-fsrs** — thuật toán SRS hiện đại (FSRS-4.5)
- **localStorage** cho persistence (có thể swap sang Supabase sau)

## Tính năng đã có

| Màn hình | Trạng thái | Ghi chú |
|---|---|---|
| Login / Register | ✅ | Local auth — email/password lưu hash đơn giản trong localStorage |
| Onboarding (3 bước) | ✅ | Chọn ngày thi, daily goal, deck |
| Dashboard | ✅ | Heatmap 52 tuần, streak, progress, countdown ngày thi |
| Flashcard SRS | ✅ | FSRS-4.5 thật, flip animation, swipe gesture, keyboard shortcuts |
| Học hôm nay (hub) | ✅ | Chọn Tất cả / Kanji / Vocab / Grammar |
| Quiz (4 loại) | ✅ | Meaning / Reading / Typing / Grammar |
| Mock Test | ✅ | **10 đề** procedurally generated (deterministic) — 6 full test 45 câu + 4 mini 20 câu |
| Decks | ✅ | List + detail view + import JSON (auto-seed deck mới) |
| Profile / Stats | ✅ | Thống kê + edit profile + xóa data |

## Dữ liệu N1

| Loại | TS seed (bundled) | Bulk JSON (auto-load) | **Tổng** | Đầy đủ N1 |
|---|---|---|---|---|
| Kanji | 120 | 300 + 300 (IDs 201-800) | **720** | ~1,200 |
| Vocabulary | 200 | 500 + 400 (IDs 301-1200) | **1,100** | ~3,500 |
| Grammar | 60 | 150 + 50 (IDs 101-300) | **260** ✓ | ~250 — **đủ N1** |

Bulk được chia thành nhiều file `n1-*-bulk-N.json` trong `public/data/` để dễ mở rộng. Mỗi lần `BULK_VERSION` bump → loader re-fetch tất cả chunks và **append cards mới vào deck Extended** hiện có.

**Cách auto-load hoạt động:**
1. TS seed (`data/*.ts`) — bundle vào JS, load instant
2. Bulk JSON (`public/data/*.json`) — fetch async khi `hydrate()`, merge vào pool, version-flagged trong localStorage để không load lại
3. Khi bulk được load lần đầu → tự động tạo **3 deck "Extended"** (Kanji / Vocab / Grammar) cho user hiện tại

Để có **dataset đầy đủ ~3500 vocab**: chạy script fetch từ public sources rồi import qua UI:

```bash
node scripts/fetch-n1-data.mjs   # tạo ./n1-full.json từ elzup/jlpt-word-list
# → Mở app → Decks → Import JSON → chọn file
```

> ⚠️ Grammar N1 chỉ có ~250 mẫu thực tế (Shinkanzen + Sou Matome cộng lại). Số 1000 không tồn tại.
> ⚠️ Public datasets chỉ có nghĩa tiếng Anh. Để có nghĩa VN chất lượng cao, cần dịch trước khi import.

## Cài đặt và chạy

### Yêu cầu
- Node.js >= 18
- npm hoặc pnpm

### Cài lần đầu

```bash
cd development/nihongo-n1
npm install
```

### Chạy dev server

```bash
npm run dev
```

Mở http://localhost:3000

### Build production

```bash
npm run build
npm start
```

## Responsive

- **Desktop (lg ≥ 1024px)**: sidebar trái 240px, content full
- **Mobile (< 1024px)**: bottom nav, content full width
- Tested cho Chrome desktop, Safari iOS, Chrome Android

## Phím tắt (Flashcard)

| Phím | Hành động |
|---|---|
| Space / Enter | Lật thẻ / Good |
| 1 | Again |
| 2 | Hard |
| 3 | Good |
| 4 | Easy |

## Gesture mobile (Flashcard)

| Vuốt | Hành động |
|---|---|
| ← | Again |
| → | Good |
| ↑ | Easy |
| ↓ | Hard |

## Import dữ liệu

Trang **Decks** → **Import JSON**. Định dạng:

```json
{
  "kanji": [
    {
      "id": 100,
      "character": "学",
      "onyomi": ["ガク"],
      "kunyomi": ["まな-ぶ"],
      "meaning_vi": "học",
      "stroke_count": 8,
      "jlpt_level": 5
    }
  ],
  "vocabulary": [
    {
      "id": 100,
      "word": "学校",
      "reading": "がっこう",
      "meaning_vi": "trường học",
      "example_jp": "学校へ行く。",
      "example_vi": "Đi đến trường.",
      "jlpt_level": 5
    }
  ],
  "grammar": [
    {
      "id": 100,
      "pattern": "～について",
      "meaning_vi": "về việc ~",
      "usage": "...",
      "examples": [{ "jp": "...", "vi": "..." }]
    }
  ]
}
```

> Sau khi import, reload trang. Hiện tại item mới chưa tự thêm vào deck — bạn cần thoát + đăng nhập lại bằng tài khoản mới để seed lại, hoặc mở rộng `ensureSeedDecks` trong `lib/store.ts` để hỗ trợ append.

## Cấu trúc thư mục

```
nihongo-n1/
├── app/                      # Next.js App Router pages
│   ├── login/, register/
│   ├── onboarding/
│   ├── dashboard/
│   ├── learn/                # Flashcard SRS
│   ├── decks/
│   ├── quiz/, quiz/[type]/play/
│   ├── mock-test/, mock-test/[id]/
│   └── profile/
├── components/
│   ├── ui/                   # Button, Card, Input, Progress
│   ├── layout/AppShell.tsx   # Sidebar + BottomNav
│   ├── flashcard/Flashcard.tsx
│   └── dashboard/Heatmap.tsx
├── lib/
│   ├── fsrs.ts               # ts-fsrs wrapper
│   ├── store.ts              # Zustand
│   ├── storage.ts            # localStorage abstraction
│   ├── srs-helpers.ts        # due cards, streak, progress
│   ├── quiz-gen.ts           # generate quiz questions
│   └── utils.ts
├── data/                     # seed data + mock test
└── types/
```

## Roadmap (sau MVP)

- [ ] Swap localStorage → Supabase (đã abstract trong `lib/storage.ts`)
- [ ] Module nghe (Choukai) với audio
- [ ] PWA full (manifest + service worker offline)
- [ ] Dark mode
- [ ] Charts (Recharts) cho stats chi tiết
- [ ] Mock test full 3 phần (Moji-Goi + Bunpou-Dokkai + Choukai)
- [ ] AI tutor giải thích ngữ pháp

## License

Cá nhân, không phân phối.
