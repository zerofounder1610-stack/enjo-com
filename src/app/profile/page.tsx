"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PostState, IgniteResult, ApologyResult, NewsData } from "@/app/page";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabase";
import type { LocalUser } from "@/components/UserSetupModal";

const NEWS_THRESHOLD = 65;

type DBRow = {
  id: string;
  type: string | null;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  likes: number;
  reposts: number;
  flame_state: string;
  flame_result: IgniteResult | null;
  apology_result: ApologyResult | null;
  news_data: NewsData | null;
  target_post_id: string | null;
  created_at: string;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

function fromDB(row: DBRow, currentHandle?: string): PostState {
  return {
    id: row.id,
    type: row.type === "news" ? "news" : undefined,
    username: row.username,
    handle: row.handle,
    avatar: row.avatar,
    content: row.content,
    timestamp: relativeTime(row.created_at),
    likes: row.likes,
    reposts: row.reposts,
    flameState: row.flame_state as PostState["flameState"],
    flameResult: row.flame_result ?? undefined,
    apologyResult: row.apology_result ?? undefined,
    newsData: row.news_data ?? undefined,
    targetPostId: row.target_post_id ?? undefined,
    isOwn: row.handle === currentHandle,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [posts, setPosts] = useState<PostState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [igniteRemaining, setIgniteRemaining] = useState<number | null>(null);
  const userRef = useRef<LocalUser | null>(null);

  async function fetchIgniteRemaining(handle: string) {
    const res = await fetch(`/api/ignite?handle=${encodeURIComponent(handle)}`);
    if (res.ok) {
      const data = await res.json();
      setIgniteRemaining(data.remaining);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("enjo_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored) as LocalUser;
    setUser(u);
    userRef.current = u;
    fetchIgniteRemaining(u.handle);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("handle", user!.handle)
        .is("type", null)
        .order("created_at", { ascending: false });
      if (data) setPosts(data.map((r) => fromDB(r as DBRow, user!.handle)));
      setLoading(false);
    }
    load();
  }, [user]);

  // リアルタイム更新
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("profile-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (payload) => {
        const updated = fromDB(payload.new as DBRow, userRef.current?.handle);
        if (updated.handle !== user.handle || updated.type === "news") return;
        setPosts((prev) =>
          prev.map((p) => (p.id === updated.id && p.flameState !== "igniting" ? updated : p))
        );
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function ignitePost(id: string) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, flameState: "igniting" as const } : p)));
    try {
      const res = await fetch("/api/ignite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: post.content, handle: userRef.current?.handle }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "炎上の生成に失敗しました");
      }
      const data: IgniteResult = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, flameState: "ignited" as const, flameResult: data } : p))
      );
      setIgniteRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
      await supabase.from("posts").update({ flame_state: "ignited", flame_result: data }).eq("id", id);
      if (data.flameScore >= NEWS_THRESHOLD) {
        fetchNews(id, post.content, data);
      }
    } catch (e) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, flameState: "normal" as const } : p)));
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      if (userRef.current) fetchIgniteRemaining(userRef.current.handle);
    }
  }

  async function fetchNews(targetId: string, postContent: string, igniteData: IgniteResult) {
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postContent, flameScore: igniteData.flameScore, comments: igniteData.comments, summary: igniteData.summary }),
      });
      if (!res.ok) return;
      const news: NewsData = await res.json();
      await supabase.from("posts").insert({
        id: `news-${targetId}`,
        type: "news",
        username: news.outlet,
        handle: news.handle,
        avatar: "📰",
        content: news.body,
        likes: Math.round(igniteData.flameScore * 22),
        reposts: Math.round(igniteData.flameScore * 35),
        flame_state: "normal",
        news_data: news,
        target_post_id: targetId,
      });
    } catch { /* ignore */ }
  }

  async function deletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("posts").update({ type: "deleted" }).eq("id", id);
  }

  async function apologizePost(id: string, apology: string): Promise<void> {
    const post = posts.find((p) => p.id === id);
    if (!post?.flameResult) return;
    const res = await fetch("/api/apologize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: post.content, apology, flameScore: post.flameResult.flameScore }),
    });
    if (!res.ok) throw new Error("謝罪の採点に失敗しました");
    const data: ApologyResult = await res.json();
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, flameState: "apologized" as const, apologyResult: data } : p))
    );
    await supabase.from("posts").update({ flame_state: "apologized", apology_result: data }).eq("id", id);
  }

  // 統計
  const ignitedPosts = posts.filter((p) => p.flameResult);
  const maxScore = ignitedPosts.length > 0 ? Math.max(...ignitedPosts.map((p) => p.flameResult!.flameScore)) : 0;
  const totalScore = ignitedPosts.reduce((s, p) => s + p.flameResult!.flameScore, 0);
  const succeededCount = posts.filter((p) => p.apologyResult?.succeeded).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto">

        {error && (
          <div className="mx-4 mt-2 bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 shrink-0">✕</button>
          </div>
        )}

        {/* ヘッダー */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="text-white hover:bg-gray-800 p-2 rounded-full transition-colors"
            aria-label="戻る"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </Link>
          <div>
            <h1 className="font-bold text-xl leading-tight">{user?.username ?? "プロフィール"}</h1>
            <p className="text-xs text-gray-500">{posts.length}件の投稿</p>
          </div>
        </div>

        {/* バナー */}
        <div className="h-32 bg-gradient-to-br from-orange-950 via-gray-900 to-black" />

        {/* アバター＋編集エリア */}
        <div className="px-4 -mt-10 flex items-end justify-between pb-3">
          <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-black flex items-center justify-center text-4xl select-none">
            {user?.avatar ?? "👤"}
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="px-4 pb-4">
          <h2 className="font-bold text-xl leading-tight">{user?.username}</h2>
          <p className="text-gray-500 text-sm">@{user?.handle}</p>

          {/* 統計 */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm">
            <span>
              <strong className="text-white">{posts.length}</strong>
              <span className="text-gray-500 ml-1">投稿</span>
            </span>
            {ignitedPosts.length > 0 && (
              <>
                <span>
                  <strong className="text-orange-400">{maxScore}</strong>
                  <span className="text-gray-500 ml-1">最高炎上スコア</span>
                </span>
                <span>
                  <strong className="text-orange-400">{totalScore}</strong>
                  <span className="text-gray-500 ml-1">累計スコア</span>
                </span>
                {succeededCount > 0 && (
                  <span>
                    <strong className="text-blue-400">{succeededCount}</strong>
                    <span className="text-gray-500 ml-1">鎮火成功</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* タブ */}
        <div className="border-b border-gray-800 flex">
          <div className="flex-1 py-3 text-sm font-bold text-center border-b-2 border-orange-500 text-white">
            投稿
          </div>
        </div>

        {/* 投稿リスト */}
        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            まだ投稿がありません
            <br />
            <Link href="/" className="text-orange-400 hover:underline text-xs mt-2 inline-block">
              ホームに戻って投稿する
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800 pb-16 sm:pb-0">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onIgnite={() => ignitePost(post.id)}
                onApologize={(text) => apologizePost(post.id, text)}
                onDelete={() => deletePost(post.id)}
                igniteRemaining={igniteRemaining ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
