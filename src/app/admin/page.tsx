"use client";

import { useEffect, useState } from "react";

type Feedback = {
  handle: string;
  username: string;
  stars: number;
  comment: string;
  created_at: string;
};

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [authed, setAuthed] = useState(false);

  async function load(h: string) {
    setLoading(true);
    const res = await fetch(`/api/feedback?handle=${encodeURIComponent(h)}`);
    if (!res.ok) {
      setError("権限がないか、ハンドルが違います");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setFeedbacks(data.feedbacks ?? []);
    setAuthed(true);
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    load(handle.trim());
  }

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.stars, 0) / feedbacks.length).toFixed(1)
    : "—";

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xs">
          <h1 className="text-xl font-bold mb-4">管理者ログイン</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm outline-none"
              placeholder="ハンドル名"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-full text-sm"
            >
              確認
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">📊 フィードバック一覧</h1>
      <p className="text-gray-400 text-sm mb-4">
        {feedbacks.length}件　平均評価：⭐ {avg}
      </p>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-gray-500">まだフィードバックはありません</p>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{f.username} <span className="text-gray-500 font-normal">@{f.handle}</span></span>
                <span className="text-yellow-400">{"⭐".repeat(f.stars)}{"☆".repeat(5 - f.stars)}</span>
              </div>
              {f.comment && <p className="text-gray-300 text-sm">{f.comment}</p>}
              <p className="text-gray-600 text-xs mt-1">{new Date(f.created_at).toLocaleString("ja-JP")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
