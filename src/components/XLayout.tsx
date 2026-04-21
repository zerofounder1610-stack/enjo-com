import type { ReactNode } from "react";

const NAV_ITEMS = [
  { icon: "🏠", label: "ホーム", active: true },
  { icon: "🔍", label: "話題を検索" },
  { icon: "🔔", label: "通知" },
  { icon: "✉️", label: "メッセージ" },
  { icon: "👤", label: "プロフィール" },
];

const TRENDS = [
  { tag: "#炎上com", count: "1,243" },
  { tag: "#焼肉論争", count: "8,521" },
  { tag: "#育児マウント", count: "12,489" },
  { tag: "#ジムマウント", count: "3,201" },
  { tag: "#禁酒宣言", count: "956" },
  { tag: "#アボカドトースト", count: "421" },
];

export default function XLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex min-h-screen">
        {/* 左サイドバー */}
        <aside className="w-16 xl:w-64 shrink-0 sticky top-0 h-screen flex flex-col py-2 px-1 xl:px-4 border-r border-gray-800">
          <div className="p-3 mb-2">
            <span className="hidden xl:block text-2xl font-black text-orange-500">炎上.com</span>
            <span className="xl:hidden text-2xl">🔥</span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-4 p-3 rounded-full hover:bg-gray-900 transition-colors text-left w-full ${
                  item.active ? "font-bold" : "text-gray-400"
                }`}
              >
                <span className="text-xl w-6 text-center">{item.icon}</span>
                <span className="hidden xl:inline text-lg">{item.label}</span>
              </button>
            ))}
          </nav>

          <button className="mt-4 mb-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full p-3 xl:py-3 xl:px-6 transition-colors flex items-center justify-center">
            <span className="hidden xl:inline">投稿する</span>
            <span className="xl:hidden text-lg">✏️</span>
          </button>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0 border-r border-gray-800">
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
            <h1 className="font-bold text-xl">ホーム</h1>
          </div>
          {children}
        </main>

        {/* 右サイドバー */}
        <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-4 px-4 py-3">
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <input
              type="text"
              placeholder="🔍 検索"
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 text-sm outline-none border-b border-gray-800"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <h2 className="font-bold text-lg px-4 py-3 border-b border-gray-800">
              いまトレンド
            </h2>
            {TRENDS.map((t, i) => (
              <div
                key={t.tag}
                className={`px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer ${
                  i < TRENDS.length - 1 ? "border-b border-gray-800" : ""
                }`}
              >
                <p className="text-xs text-gray-500">日本のトレンド</p>
                <p className="font-bold text-sm mt-0.5">{t.tag}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.count}件の投稿</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 px-2">
            © 2026 炎上.com — シミュレーターです
          </p>
        </aside>
      </div>
    </div>
  );
}
