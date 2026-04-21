"use client";

import { useRef } from "react";
import type { ApologyResult } from "@/app/page";

type Props = {
  post: string;
  apologyResult: ApologyResult;
  flameScore: number;
  onReset: () => void;
};

const W = 1200;
const H = 630;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split("");
  const lines: string[] = [];
  let line = "";
  for (const ch of words) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawScoreBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  score: number,
  color: string
) {
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.roundRect(x, y, w, 12, 6);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, (w * score) / 100, 12, 6);
  ctx.fill();
}

function generateShareCard(
  post: string,
  flameScore: number,
  extinguishScore: number,
  succeeded: boolean
): string {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 背景グラデーション
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (succeeded) {
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(1, "#1e3a5f");
  } else {
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(1, "#3b0f0f");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 左カラム（投稿 + スコアバー）
  const padX = 64;
  const colW = W / 2 - padX - 32;

  // サイトタイトル
  ctx.font = "bold 36px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#f97316";
  ctx.fillText("炎上.com", padX, 72);

  ctx.font = "18px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("SNS炎上シミュレーター", padX, 100);

  // 区切り線
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, 116);
  ctx.lineTo(W - padX, 116);
  ctx.stroke();

  // 元投稿ラベル
  ctx.font = "bold 20px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText("元の投稿", padX, 156);

  // 元投稿テキスト（折り返し）
  ctx.font = "22px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#f3f4f6";
  const postLines = wrapText(ctx, post, colW);
  const maxPostLines = 4;
  postLines.slice(0, maxPostLines).forEach((line, i) => {
    const displayLine =
      i === maxPostLines - 1 && postLines.length > maxPostLines
        ? line.slice(0, -1) + "…"
        : line;
    ctx.fillText(displayLine, padX, 186 + i * 34);
  });

  // スコアセクション
  const scoreY = 340;
  ctx.font = "bold 20px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText("炎上スコア", padX, scoreY);
  ctx.font = "bold 48px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#fb923c";
  ctx.fillText(`${flameScore}`, padX, scoreY + 56);
  drawScoreBar(ctx, padX, scoreY + 70, colW, flameScore, "#f97316");

  ctx.font = "bold 20px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText("鎮火スコア", padX, scoreY + 120);
  ctx.font = "bold 48px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#60a5fa";
  ctx.fillText(`${extinguishScore}`, padX, scoreY + 176);
  drawScoreBar(ctx, padX, scoreY + 190, colW, extinguishScore, "#3b82f6");

  // 右カラム（結果）
  const rightX = W / 2 + 32;
  const rightW = W / 2 - padX - 32;

  // 結果パネル背景
  ctx.fillStyle = succeeded ? "rgba(30,58,138,0.4)" : "rgba(127,29,29,0.4)";
  ctx.beginPath();
  ctx.roundRect(rightX, 136, rightW, 358, 20);
  ctx.fill();
  ctx.strokeStyle = succeeded ? "#3b82f6" : "#ef4444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rightX, 136, rightW, 358, 20);
  ctx.stroke();

  // 絵文字
  ctx.font = "96px serif";
  ctx.textAlign = "center";
  ctx.fillText(succeeded ? "💧" : "🔥", rightX + rightW / 2, 280);

  // 結果テキスト
  ctx.font = "bold 40px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = succeeded ? "#93c5fd" : "#fca5a5";
  ctx.fillText(succeeded ? "鎮火成功！" : "完全炎上...", rightX + rightW / 2, 348);

  // バッジ
  const badgeColor = succeeded ? "#1d4ed8" : "#b91c1c";
  ctx.fillStyle = badgeColor;
  ctx.beginPath();
  ctx.roundRect(rightX + rightW / 2 - 90, 374, 180, 44, 22);
  ctx.fill();
  ctx.font = "bold 22px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    succeeded ? `炎上度 ${flameScore}% を鎮火` : `炎上度 ${flameScore}%`,
    rightX + rightW / 2,
    402
  );

  // フッター
  ctx.textAlign = "left";
  ctx.font = "18px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "#4b5563";
  ctx.fillText("#炎上com  enjo.com", padX, H - 32);

  return canvas.toDataURL("image/png");
}

export default function ResultStage({ post, apologyResult, flameScore, onReset }: Props) {
  const { succeeded, extinguishScore, feedback } = apologyResult;
  const sharingRef = useRef(false);

  function handleShare() {
    if (sharingRef.current) return;
    sharingRef.current = true;

    const dataUrl = generateShareCard(post, flameScore, extinguishScore, succeeded);

    // 画像ダウンロード
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "enjo-result.png";
    a.click();

    // X投稿画面を開く
    const xText = encodeURIComponent(
      `炎上度${flameScore}%でした${succeeded ? "、鎮火成功！💧" : "🔥 完全炎上..."} #炎上com`
    );
    setTimeout(() => {
      window.open(`https://x.com/intent/tweet?text=${xText}`, "_blank");
      sharingRef.current = false;
    }, 300);
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-4 items-center text-center">
      {/* 結果ビジュアル */}
      <div
        className={`w-full rounded-2xl p-8 border ${
          succeeded ? "bg-blue-950 border-blue-600" : "bg-red-950 border-red-600"
        }`}
      >
        <div className="text-6xl mb-4">{succeeded ? "💧" : "🔥"}</div>
        <h2
          className={`text-2xl font-black mb-2 ${
            succeeded ? "text-blue-300" : "text-red-400"
          }`}
        >
          {succeeded ? "鎮火成功！" : "完全炎上..."}
        </h2>
        <p className="text-gray-300 text-sm">{feedback}</p>
      </div>

      {/* スコアまとめ */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <div className="flex justify-around">
          <div>
            <p className="text-xs text-gray-500">炎上スコア</p>
            <p className="text-2xl font-black text-orange-400">{flameScore}</p>
          </div>
          <div className="w-px bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500">鎮火スコア</p>
            <p className="text-2xl font-black text-blue-400">{extinguishScore}</p>
          </div>
          <div className="w-px bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500">結果</p>
            <p className="text-2xl font-black">{succeeded ? "✅" : "❌"}</p>
          </div>
        </div>
      </div>

      {/* シェアボタン */}
      <button
        onClick={handleShare}
        className="w-full bg-black hover:bg-gray-900 border border-gray-600 text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Xでシェア（画像保存 + ポスト）
      </button>

      <button
        onClick={onReset}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full transition-colors"
      >
        もう一度炎上する 🔥
      </button>
    </div>
  );
}
