"use client";

import { useState } from "react";

export default function ComposeBox({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-gray-800 px-4 py-3 flex gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg shrink-0">
        👤
      </div>
      <div className="flex-1 min-w-0">
        <textarea
          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg min-h-[72px]"
          placeholder="いまどうしてる？"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
        />
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <span className="text-sm text-gray-500">{text.length}/280</span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-1.5 rounded-full text-sm transition-colors"
          >
            投稿
          </button>
        </div>
      </div>
    </form>
  );
}
