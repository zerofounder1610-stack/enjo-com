"use client";

import { useState } from "react";

type Props = {
  handle: string;
  username: string;
  onClose: () => void;
};

export default function FeedbackModal({ handle, username, onClose }: Props) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stars === 0) return;
    setSending(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, username, stars, comment }),
    });
    setSending(false);
    setDone(true);
    localStorage.setItem("enjo_feedback_sent", "1");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🙏</div>
            <h2 className="text-xl font-bold mb-2">ありがとうございました！</h2>
            <p className="text-gray-400 text-sm mb-5">フィードバックを送信しました。</p>
            <button
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-full transition-colors"
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-1">
              <div className="text-3xl mb-2">🔥</div>
              <h2 className="text-xl font-bold">炎上上限に達しました</h2>
              <p className="text-gray-400 text-sm mt-1">遊んでくれてありがとう！<br />感想を聞かせてください。</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="text-xs text-gray-400 mb-2 block text-center">評価</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setStars(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      {n <= (hovered || stars) ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
                {stars > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-1">
                    {["", "うーん…", "まあまあ", "良かった！", "面白かった！", "最高！！"][stars]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">感想・要望（任意）</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm outline-none resize-none transition-colors"
                  placeholder="面白かった、こんな機能が欲しい、など..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { localStorage.setItem("enjo_feedback_sent", "1"); onClose(); }}
                  className="flex-1 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 font-bold py-2.5 rounded-full transition-colors text-sm"
                >
                  スキップ
                </button>
                <button
                  type="submit"
                  disabled={stars === 0 || sending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-full transition-colors text-sm"
                >
                  {sending ? "送信中..." : "送信する"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
