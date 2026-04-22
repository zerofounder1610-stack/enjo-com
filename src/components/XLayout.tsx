"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LocalUser } from "@/components/UserSetupModal";

export type RankingEntry = {
  id: string;
  avatar: string;
  username: string;
  content: string;
  flameScore: number;
  succeeded?: boolean;
};

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

const NAV_ITEMS = [
  { icon: "🏠", label: "ホーム", href: "/" },
  { icon: "👤", label: "プロフィール", href: "/profile" },
];

export default function XLayout({
  children,
  user,
  ranking = [],
}: {
  children: ReactNode;
  user: LocalUser | null;
  ranking?: RankingEntry[];
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex min-h-screen">

        {/* 左サイドバー（sm以上） */}
        <aside className="hidden sm:flex w-16 xl:w-64 shrink-0 sticky top-0 h-screen flex-col py-2 px-1 xl:px-4 border-r border-gray-800">
          <div className="p-3 mb-2">
            <span className="hidden xl:block text-2xl font-black text-orange-500">炎上.com</span>
            <span className="xl:hidden text-2xl">🔥</span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-3 rounded-full hover:bg-gray-900 transition-colors w-full ${
                  pathname === item.href ? "font-bold text-white" : "text-gray-400"
                }`}
              >
                <span className="text-xl w-6 text-center">{item.icon}</span>
                <span className="hidden xl:inline text-lg">{item.label}</span>
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-4 mb-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full p-3 xl:py-3 xl:px-6 transition-colors flex items-center justify-center"
          >
            <span className="hidden xl:inline">投稿する</span>
            <span className="xl:hidden text-lg">✏️</span>
          </Link>

          {user && (
            <Link
              href="/profile"
              className="hidden xl:flex items-center gap-2 p-3 rounded-full hover:bg-gray-900 transition-colors mb-2"
            >
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-lg shrink-0">
                {user.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{user.username}</p>
                <p className="text-gray-500 text-xs truncate">@{user.handle}</p>
              </div>
            </Link>
          )}
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0 border-r border-gray-800 pb-16 sm:pb-0">
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
            <h1 className="font-bold text-xl">ホーム</h1>
          </div>
          {children}
        </main>

        {/* 右サイドバー（xl以上） */}
        <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-4 px-4 py-3">
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <input
              type="text"
              placeholder="🔍 検索"
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 text-sm outline-none border-b border-gray-800"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <h2 className="font-bold text-lg px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              🔥 炎上ランキング
            </h2>
            {ranking.length === 0 ? (
              <p className="text-xs text-gray-500 px-4 py-4">まだ炎上投稿がありません</p>
            ) : (
              ranking.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`px-4 py-3 hover:bg-gray-800 transition-colors ${
                    i < ranking.length - 1 ? "border-b border-gray-800" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg w-6 text-center shrink-0">
                      {RANK_MEDAL[i] ?? `${i + 1}`}
                    </span>
                    <span className="text-sm shrink-0">{entry.avatar}</span>
                    <span className="font-bold text-sm truncate">{entry.username}</span>
                    <span className="ml-auto text-orange-400 font-bold text-sm shrink-0">
                      {entry.flameScore}点
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate pl-8">{entry.content}</p>
                  {entry.succeeded !== undefined && (
                    <p className="text-xs pl-8 mt-0.5">
                      {entry.succeeded
                        ? <span className="text-blue-400">💧 鎮火済み</span>
                        : <span className="text-red-400">🔥 炎上中</span>}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-gray-600 px-2">
            © 2026 炎上.com — シミュレーターです
          </p>
        </aside>
      </div>

      {/* モバイル用ボトムナビ（sm未満） */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 z-20 flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
              pathname === item.href ? "text-white" : "text-gray-500"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
