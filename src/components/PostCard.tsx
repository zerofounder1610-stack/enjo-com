"use client";

import { useState } from "react";
import type { PostState } from "@/app/page";
import FlameMeter from "./FlameMeter";

type Props = {
  post: PostState;
  onIgnite: () => void;
  onApologize: (text: string) => Promise<void>;
};

const INTENSITY_EMOJI = ["", "😤", "😡", "🤬", "💢", "🔥"];

export default function PostCard({ post, onIgnite, onApologize }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [showApologyBox, setShowApologyBox] = useState(false);
  const [apologyText, setApologyText] = useState("");
  const [apologizing, setApologizing] = useState(false);
  const [apologyError, setApologyError] = useState<string | null>(null);

  async function handleApologize(e: React.FormEvent) {
    e.preventDefault();
    if (!apologyText.trim()) return;
    setApologizing(true);
    setApologyError(null);
    try {
      await onApologize(apologyText.trim());
      setShowApologyBox(false);
    } catch (err) {
      setApologyError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setApologizing(false);
    }
  }

  const isIgnited = post.flameState === "ignited" || post.flameState === "apologized";

  return (
    <article className="px-4 py-3 hover:bg-gray-950 transition-colors">
      <div className="flex gap-3">
        {/* アバター */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl shrink-0 select-none">
          {post.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-sm">{post.username}</span>
            <span className="text-gray-500 text-sm">@{post.handle}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{post.timestamp}</span>
            {post.flameState === "igniting" && (
              <span className="ml-auto text-xs text-orange-400 animate-pulse">
                炎上分析中...
              </span>
            )}
            {isIgnited && post.flameResult && (
              <span className="ml-auto bg-orange-500/15 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/30 font-semibold shrink-0">
                炎上中🔥 {post.flameResult.flameScore}点
              </span>
            )}
          </div>

          {/* 投稿本文 */}
          <p className="text-[15px] mt-1 text-gray-100 leading-relaxed">{post.content}</p>

          {/* 炎上セクション */}
          {isIgnited && post.flameResult && (
            <div className="mt-3 space-y-2">
              <FlameMeter score={post.flameResult.flameScore} />
              <p className="text-xs text-gray-400">{post.flameResult.summary}</p>

              <button
                onClick={() => setShowComments((v) => !v)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showComments
                  ? "コメントを閉じる"
                  : `コメントを見る（${post.flameResult.comments.length}件）`}
              </button>

              {showComments && (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {post.flameResult.comments.map((c, i) => (
                    <div key={i} className="flex gap-2 bg-gray-900 rounded-xl px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-sm shrink-0 select-none">
                        {INTENSITY_EMOJI[c.intensity] ?? "😤"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-300">{c.username}</p>
                        <p className="text-xs text-gray-200 mt-0.5 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 謝罪結果 */}
          {post.flameState === "apologized" && post.apologyResult && (
            <div
              className={`mt-3 rounded-xl px-3 py-2.5 border text-sm ${
                post.apologyResult.succeeded
                  ? "bg-blue-950/40 border-blue-700/60 text-blue-300"
                  : "bg-red-950/40 border-red-700/60 text-red-300"
              }`}
            >
              <p className="font-bold text-sm mb-1">
                {post.apologyResult.succeeded ? "💧 鎮火成功！" : "🔥 完全炎上..."}
                <span className="font-normal text-xs ml-2 opacity-70">
                  鎮火スコア: {post.apologyResult.extinguishScore}点
                </span>
              </p>
              <p className="text-xs opacity-80 leading-relaxed">{post.apologyResult.feedback}</p>
            </div>
          )}

          {/* 謝罪ボックス */}
          {post.flameState === "ignited" && showApologyBox && (
            <form onSubmit={handleApologize} className="mt-3">
              <textarea
                className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 text-white text-sm placeholder-gray-500 rounded-xl px-3 py-2.5 resize-none outline-none min-h-[80px] transition-colors"
                placeholder="謝罪文を書いて鎮火を試みる..."
                value={apologyText}
                onChange={(e) => setApologyText(e.target.value)}
                maxLength={500}
                disabled={apologizing}
              />
              {apologyError && (
                <p className="text-xs text-red-400 mt-1">{apologyError}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="submit"
                  disabled={!apologyText.trim() || apologizing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                >
                  {apologizing ? "採点中..." : "謝罪を投稿 🙇"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowApologyBox(false); setApologyText(""); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}

          {/* アクションバー */}
          <div className="flex items-center gap-0.5 mt-3 text-gray-500 text-xs -ml-1.5">
            <button className="flex items-center gap-1.5 hover:text-blue-400 hover:bg-blue-400/10 transition-colors px-2 py-1.5 rounded-full">
              <span>💬</span>
              <span>0</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-green-400 hover:bg-green-400/10 transition-colors px-2 py-1.5 rounded-full">
              <span>🔁</span>
              <span>{post.reposts}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-pink-400 hover:bg-pink-400/10 transition-colors px-2 py-1.5 rounded-full">
              <span>❤️</span>
              <span>{post.likes}</span>
            </button>

            <div className="flex-1" />

            {post.flameState === "normal" && (
              <button
                onClick={onIgnite}
                className="text-orange-400 hover:text-orange-300 border border-orange-500/40 hover:border-orange-400 hover:bg-orange-500/10 text-xs px-3 py-1 rounded-full transition-colors font-medium"
              >
                炎上させる🔥
              </button>
            )}
            {post.flameState === "igniting" && (
              <span className="text-orange-400 text-xs animate-pulse px-3">
                炎上中...
              </span>
            )}
            {post.flameState === "ignited" && !showApologyBox && (
              <button
                onClick={() => setShowApologyBox(true)}
                className="text-blue-400 hover:text-blue-300 border border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10 text-xs px-3 py-1 rounded-full transition-colors font-medium"
              >
                謝罪する🙇
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
