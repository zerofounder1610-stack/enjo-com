"use client";

import { useState } from "react";

type Props = {
  onSubmit: (post: string) => void;
  loading: boolean;
};

export default function PostInput({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  }

  return (
    <div className="w-full max-w-xl">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <p className="font-bold text-sm">あなた</p>
            <p className="text-gray-500 text-xs">@user</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none text-lg outline-none min-h-[120px]"
            placeholder="いま何してる？（炎上しそうな投稿をどうぞ）"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            disabled={loading}
          />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <span className="text-gray-500 text-sm">{text.length} / 280</span>
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-full transition-colors"
            >
              {loading ? "炎上中..." : "投稿する 🔥"}
            </button>
          </div>
        </form>
      </div>

      <p className="text-center text-gray-600 text-xs mt-4">
        ※ これはシミュレーターです。実際には投稿されません。
      </p>
    </div>
  );
}
