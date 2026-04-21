import type { IgniteResult } from "@/app/page";
import FlameMeter from "./FlameMeter";

type Props = {
  post: string;
  result: IgniteResult;
  onApologize: () => void;
};

const intensityEmoji = ["", "😤", "😡", "🤬", "💢", "🔥"];

export default function FlameStage({ post, result, onApologize }: Props) {
  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      {/* 元投稿 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-base">
            👤
          </div>
          <div>
            <p className="font-bold text-sm">あなた</p>
            <p className="text-gray-500 text-xs">@user</p>
          </div>
        </div>
        <p className="text-white">{post}</p>
      </div>

      {/* 炎上度メーター */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <FlameMeter score={result.flameScore} />
        <p className="text-gray-400 text-sm mt-3">{result.summary}</p>
      </div>

      {/* コメント一覧 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-gray-400 mb-3">
          リプライ ({result.comments.length})
        </h2>
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {result.comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                {intensityEmoji[c.intensity] ?? "😤"}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300">{c.username}</p>
                <p className="text-sm text-gray-200 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 謝罪ボタン */}
      <button
        onClick={onApologize}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-colors"
      >
        謝罪文を書いて鎮火を試みる 🙇
      </button>
    </div>
  );
}
