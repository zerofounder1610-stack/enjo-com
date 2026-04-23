"use client";

import { useState } from "react";
import type { LocalUser } from "@/components/UserSetupModal";

type Props = {
  onSubmit: (content: string) => void;
  user: LocalUser | null;
  onNeedUser: () => void;
  postRemaining?: number | null;
};

export default function ComposeBox({ onSubmit, user, onNeedUser, postRemaining }: Props) {
  const [text, setText] = useState("");

  const atPostLimit = postRemaining !== null && postRemaining !== undefined && postRemaining <= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { onNeedUser(); return; }
    if (atPostLimit) return;
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-800 px-4 py-3 flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg shrink-0 select-none">
        {user?.avatar ?? "👤"}
      </div>
      <div className="flex-1 min-w-0">
        {user && (
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-bold text-gray-300">{user.username}</span>
            　@{user.handle}
          </p>
        )}
        <textarea
          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg min-h-[72px]"
          placeholder="いまどうしてる？"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          onFocus={() => { if (!user) onNeedUser(); }}
        />
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{text.length}/280</span>
            {postRemaining !== null && postRemaining !== undefined && (
              <span className={`text-xs ${atPostLimit ? "text-red-400" : postRemaining <= 2 ? "text-orange-400" : "text-gray-600"}`}>
                投稿残り{postRemaining}回
              </span>
            )}
          </div>
          {atPostLimit ? (
            <span className="text-gray-600 border border-gray-700 text-xs px-4 py-1.5 rounded-full cursor-not-allowed">
              上限✋
            </span>
          ) : (
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-1.5 rounded-full text-sm transition-colors"
            >
              投稿
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
