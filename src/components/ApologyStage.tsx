"use client";

import { useState } from "react";
import FlameMeter from "./FlameMeter";

type Props = {
  post: string;
  flameScore: number;
  onSubmit: (apology: string) => void;
  loading: boolean;
};

export default function ApologyStage({ post, flameScore, onSubmit, loading }: Props) {
  const [apology, setApology] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (apology.trim()) onSubmit(apology.trim());
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      {/* 元投稿（小さく） */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 opacity-70">
        <p className="text-xs text-gray-500 mb-1">問題の投稿</p>
        <p className="text-gray-300 text-sm">{post}</p>
      </div>

      {/* 現在の炎上度 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <FlameMeter score={flameScore} />
      </div>

      {/* 謝罪文入力 */}
      <div className="bg-gray-900 border border-orange-800 rounded-2xl p-6">
        <h2 className="font-bold text-orange-400 mb-3 text-sm">謝罪文を書いて炎を鎮めよ</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-gray-800 text-white placeholder-gray-500 resize-none text-base rounded-xl p-3 outline-none min-h-[140px] border border-gray-700 focus:border-orange-500 transition-colors"
            placeholder="この度は誠に申し訳ございませんでした..."
            value={apology}
            onChange={(e) => setApology(e.target.value)}
            maxLength={500}
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-500 text-sm">{apology.length} / 500</span>
            <button
              type="submit"
              disabled={!apology.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-full transition-colors"
            >
              {loading ? "採点中..." : "謝罪を投稿 🙇"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
