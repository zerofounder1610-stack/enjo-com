"use client";

import { useState } from "react";

const AVATARS = ["👤", "👩", "👨", "👩‍💼", "👨‍💼", "👩‍🎓", "👨‍🎓", "🧑", "🐱", "🐶", "🦊", "🐻"];

export type LocalUser = { username: string; handle: string; avatar: string };

type Props = {
  onSave: (user: LocalUser) => void;
};

export default function UserSetupModal({ onSave }: Props) {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("👤");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const name = username.trim() || `ゲスト${Math.floor(Math.random() * 9000 + 1000)}`;
    const handle =
      name.replace(/[^\w぀-ゟ゠-ヿ一-龯]/g, "").slice(0, 15) ||
      `user${Math.floor(Math.random() * 9000 + 1000)}`;
    const user: LocalUser = { username: name, handle, avatar };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
        return;
      }

      localStorage.setItem("enjo_user", JSON.stringify(user));
      onSave(user);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-1">ようこそ 炎上.com へ</h2>
        <p className="text-gray-400 text-sm mb-5">他のユーザーに表示される名前を設定してください</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">アバター</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setAvatar(e)}
                  className={`text-2xl p-1.5 rounded-xl transition-colors ${
                    avatar === e ? "bg-orange-500/30 ring-2 ring-orange-500" : "hover:bg-gray-800"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">ユーザー名</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              placeholder="例：たろう"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-xl px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-full transition-colors"
          >
            {loading ? "確認中..." : "はじめる 🔥"}
          </button>
        </form>
      </div>
    </div>
  );
}
