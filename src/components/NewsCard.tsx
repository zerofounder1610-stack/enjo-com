import type { PostState } from "@/app/page";

type Props = {
  post: PostState;
};

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}千`;
  return String(Math.round(n));
}

export default function NewsCard({ post }: Props) {
  const { newsData } = post;
  if (!newsData) return null;

  return (
    <article className="px-4 py-3 hover:bg-gray-950 transition-colors border-l-2 border-orange-500/50">
      <div className="flex gap-3">
        {/* アバター */}
        <div className="w-10 h-10 rounded-full bg-orange-950 border border-orange-700 flex items-center justify-center text-xl shrink-0 select-none">
          {post.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-sm truncate shrink min-w-0">{post.username}</span>
            <span className="text-gray-500 text-sm shrink-0">@{post.handle}</span>
            <span className="text-gray-500 text-sm shrink-0">·</span>
            <span className="text-gray-500 text-sm shrink-0 whitespace-nowrap">{post.timestamp}</span>
            <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold shrink-0 whitespace-nowrap">
              ニュース
            </span>
          </div>

          {/* 見出し */}
          <p className="font-bold text-[15px] mt-1.5 text-white leading-snug">
            {newsData.headline}
          </p>

          {/* 記事本文 */}
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">{post.content}</p>

          {/* タグ */}
          {newsData.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {newsData.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* エンゲージメント */}
          <div className="mt-3 pt-3 border-t border-gray-800 flex gap-4 text-xs text-gray-400">
            <span><strong className="text-white">{fmt(post.reposts)}</strong> リポスト</span>
            <span><strong className="text-white">{fmt(post.likes)}</strong> いいね</span>
          </div>

          {/* アクションバー */}
          <div className="flex items-center gap-0.5 mt-2 text-gray-500 text-xs -ml-1.5">
            <button className="flex items-center gap-1.5 hover:text-blue-400 hover:bg-blue-400/10 transition-colors px-2 py-1.5 rounded-full">
              <span>💬</span><span>{fmt(Math.round(post.likes * 0.3))}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-green-400 hover:bg-green-400/10 transition-colors px-2 py-1.5 rounded-full">
              <span>🔁</span><span>{fmt(post.reposts)}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-pink-400 hover:bg-pink-400/10 transition-colors px-2 py-1.5 rounded-full">
              <span>❤️</span><span>{fmt(post.likes)}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
