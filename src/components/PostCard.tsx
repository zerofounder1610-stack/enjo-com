"use client";

import { useRef, useState } from "react";
import type { PostState } from "@/app/page";
import FlameMeter from "./FlameMeter";

type Props = {
  post: PostState;
  onIgnite: () => void;
  onApologize: (text: string) => Promise<void>;
  onDelete?: () => void;
  igniteRemaining?: number;
  isAdmin?: boolean;
};

const INTENSITY_EMOJI = ["", "😤", "😡", "🤬", "💢", "🔥"];

function getTitle(score: number): { label: string; color: string } | null {
  if (score >= 100) return { label: "🌋 伝説の炎上", color: "text-red-300 bg-red-950/60 border-red-500/50" };
  if (score >= 90)  return { label: "👑 炎上王",     color: "text-orange-300 bg-orange-950/60 border-orange-500/50" };
  if (score >= 80)  return { label: "🔥 炎上マスター", color: "text-orange-400 bg-orange-950/50 border-orange-600/50" };
  if (score >= 70)  return { label: "💢 上級炎上者",  color: "text-yellow-400 bg-yellow-950/40 border-yellow-600/40" };
  if (score >= 50)  return { label: "🔥 中級炎上者",  color: "text-yellow-500 bg-yellow-950/30 border-yellow-700/30" };
  if (score >= 30)  return { label: "😤 初級炎上者",  color: "text-gray-300 bg-gray-800/60 border-gray-600/40" };
  return null;
}

function calcEngagement(score: number) {
  const s = score;
  return {
    impressions: s * 800 + s * s * 5,
    reposts: s * 30 + s * s * 0.4,
    likes: s * 15 + s * s * 0.2,
    replies: s * 8 + s * s * 0.1,
  };
}

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}千`;
  return String(Math.round(n));
}

export default function PostCard({ post, onIgnite, onApologize, onDelete, igniteRemaining, isAdmin }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [showApologyBox, setShowApologyBox] = useState(false);
  const [apologyText, setApologyText] = useState("");
  const [apologizing, setApologizing] = useState(false);
  const [apologyError, setApologyError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const usernameRef = useRef<HTMLSpanElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  async function handleShare() {
    if (sharing || !post.flameResult) return;
    setSharing(true);

    const target = cardRef.current;
    if (!target) return;

    try {
      // modern-screenshot は SVG foreignObject 経由でキャプチャするため
      // oklch/lab などのブラウザ依存カラーもそのまま処理できる
      const { domToPng } = await import("modern-screenshot");

      const dataUrl = await domToPng(target, { scale: 2 });
      const flameScore = post.flameResult!.flameScore;

      // Android / iOS のみ Web Share API（ファイル共有）
      const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobileUA && navigator.canShare) {
        const blob = await fetch(dataUrl).then((r) => r.blob());
        const file = new File([blob], "enjo-result.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `炎上スコア${flameScore}点！`,
            text: `炎上度${flameScore}点でした🔥 #炎上com`,
          });
          return;
        }
      }

      // PC: 画像ダウンロード
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "enjo-result.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("シェア失敗:", err);
      if (err instanceof Error && err.name === "AbortError") return;
      alert("シェアに失敗しました: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSharing(false);
    }
  }

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

  const flameScore = post.flameResult?.flameScore ?? 0;
  const title = isIgnited && post.flameResult ? getTitle(flameScore) : null;

  return (
  <>
    <article ref={cardRef} className="px-4 py-3 hover:bg-gray-950 transition-colors">
      <div className="flex gap-3">
        {/* アバター */}
        <div ref={avatarRef} className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl shrink-0 select-none">
          {post.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-1 min-w-0">
            <span ref={usernameRef} className="font-bold text-sm truncate shrink min-w-0">{post.username}</span>
            <span ref={handleRef} className="text-gray-500 text-sm shrink-0">@{post.handle}</span>
            <span className="text-gray-500 text-sm shrink-0">·</span>
            <span className="text-gray-500 text-sm shrink-0 whitespace-nowrap">{post.timestamp}</span>
            <div className="ml-auto flex items-center gap-1 shrink-0">
            {post.flameState === "igniting" && (
              <span className="text-xs text-orange-400 animate-pulse whitespace-nowrap">
                炎上分析中...
              </span>
            )}
            {isIgnited && post.flameResult && (
              <span className="bg-orange-500/15 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/30 font-semibold whitespace-nowrap">
                炎上中🔥 {post.flameResult.flameScore}点
              </span>
            )}
            {(post.isOwn || isAdmin) && onDelete && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="text-gray-500 hover:text-gray-300 hover:bg-gray-800 p-1 rounded-full transition-colors"
                >
                  ···
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-7 z-20 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[120px]">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          const msg = isAdmin && !post.isOwn
                            ? `【管理者】この投稿を削除しますか？`
                            : "この投稿を削除しますか？\n※炎上させた場合、使用回数は減りません。";
                          if (window.confirm(msg)) onDelete();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                      >
                        🗑 投稿を削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            </div>
          </div>

          {/* 謝罪ボタン（炎上時・ヘッダー直下） */}
          {post.flameState === "ignited" && !showApologyBox && (
            <div className="flex justify-end mt-1">
              <button
                onClick={() => setShowApologyBox(true)}
                className="text-blue-400 hover:text-blue-300 border border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10 text-xs px-3 py-1 rounded-full transition-colors font-medium"
              >
                謝罪する🙇
              </button>
            </div>
          )}

          {/* 投稿本文 */}
          <p className="text-[15px] mt-1 text-gray-100 leading-relaxed">{post.content}</p>

          {/* 炎上セクション */}
          {isIgnited && post.flameResult && (
            <div className="mt-3 space-y-2">
              <FlameMeter score={post.flameResult.flameScore} />
              {title && (
                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-bold ${title.color}`}>
                  {title.label}
                </span>
              )}
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

          {/* インプレッション行（炎上時） */}
          {isIgnited && post.flameResult && (() => {
            const eng = calcEngagement(post.flameResult.flameScore);
            return (
              <div className="mt-3 pt-3 border-t border-gray-800 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                <span><strong className="text-white">{fmt(eng.impressions)}</strong> 表示</span>
                <span><strong className="text-white">{fmt(eng.reposts)}</strong> リポスト</span>
                <span><strong className="text-white">{fmt(eng.likes)}</strong> いいね</span>
                <span><strong className="text-white">{fmt(eng.replies)}</strong> 返信</span>
              </div>
            );
          })()}

          {/* アクションバー */}
          <div className="flex items-center gap-0.5 mt-3 text-gray-500 text-xs -ml-1.5">
            {isIgnited && post.flameResult ? (() => {
              const eng = calcEngagement(post.flameResult.flameScore);
              return (<>
                <button className="flex items-center gap-1.5 hover:text-blue-400 hover:bg-blue-400/10 transition-colors px-2 py-1.5 rounded-full">
                  <span>💬</span><span>{fmt(eng.replies)}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-green-400 hover:bg-green-400/10 transition-colors px-2 py-1.5 rounded-full">
                  <span>🔁</span><span>{fmt(eng.reposts)}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-pink-400 hover:bg-pink-400/10 transition-colors px-2 py-1.5 rounded-full">
                  <span>❤️</span><span>{fmt(eng.likes)}</span>
                </button>
              </>);
            })() : (<>
              <button className="flex items-center gap-1.5 hover:text-blue-400 hover:bg-blue-400/10 transition-colors px-2 py-1.5 rounded-full">
                <span>💬</span><span>0</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-green-400 hover:bg-green-400/10 transition-colors px-2 py-1.5 rounded-full">
                <span>🔁</span><span>{post.reposts}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-pink-400 hover:bg-pink-400/10 transition-colors px-2 py-1.5 rounded-full">
                <span>❤️</span><span>{post.likes}</span>
              </button>
            </>)}

            <div className="flex-1" />

            {post.flameState === "normal" && post.isOwn && (
              igniteRemaining === 0 ? (
                <span className="text-gray-600 border border-gray-700 text-xs px-3 py-1 rounded-full cursor-not-allowed">
                  上限🔥
                </span>
              ) : (
                <button
                  onClick={onIgnite}
                  className="text-orange-400 hover:text-orange-300 border border-orange-500/40 hover:border-orange-400 hover:bg-orange-500/10 text-xs px-3 py-1 rounded-full transition-colors font-medium"
                >
                  炎上させる🔥{igniteRemaining !== undefined && igniteRemaining <= 2 && (
                    <span className="ml-1 text-orange-300">残り{igniteRemaining}</span>
                  )}
                </button>
              )
            )}
            {post.flameState === "igniting" && post.isOwn && (
              <span className="text-orange-400 text-xs animate-pulse px-3">炎上中...</span>
            )}
            {isIgnited && (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-50 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-xs px-3 py-1 rounded-full transition-colors font-medium ml-1"
                title="炎上カードを保存"
              >
                {sharing ? (
                  <span className="animate-pulse">保存中...</span>
                ) : (
                  <>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    シェア
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>

  </>
  );
}
