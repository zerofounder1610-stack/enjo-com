"use client";

import { useEffect, useState, useRef } from "react";
import XLayout, { type RankingEntry } from "@/components/XLayout";
import ComposeBox from "@/components/ComposeBox";
import PostCard from "@/components/PostCard";
import NewsCard from "@/components/NewsCard";
import UserSetupModal, { type LocalUser } from "@/components/UserSetupModal";
import FeedbackModal from "@/components/FeedbackModal";
import WelcomeModal from "@/components/WelcomeModal";
import { supabase } from "@/lib/supabase";

const NEWS_THRESHOLD = 75;

export type Comment = { username: string; text: string; intensity: number };
export type IgniteResult = { comments: Comment[]; flameScore: number; summary: string };
export type ApologyResult = { extinguishScore: number; feedback: string; succeeded: boolean };
export type NewsData = {
  outlet: string;
  handle: string;
  headline: string;
  body: string;
  tags: string[];
};

export type PostState = {
  id: string;
  type?: "news";
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  reposts: number;
  flameState: "normal" | "igniting" | "ignited" | "apologized";
  flameResult?: IgniteResult;
  apologyResult?: ApologyResult;
  isOwn?: boolean;
  newsData?: NewsData;
  targetPostId?: string;
};

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

export default function Home() {
  const [posts, setPosts] = useState<PostState[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [igniteRemaining, setIgniteRemaining] = useState<number | null>(null);
  const [igniteLimit, setIgniteLimit] = useState(5);
  const [isAdmin, setIsAdmin] = useState(false);
  const [postRemaining, setPostRemaining] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const userRef = useRef<LocalUser | null>(null);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);
  const pullYRef = useRef(0);
  const PULL_THRESHOLD = 65;

  async function fetchIgniteRemaining(handle: string) {
    const res = await fetch(`/api/ignite?handle=${encodeURIComponent(handle)}`);
    if (res.ok) {
      const data = await res.json();
      setIgniteRemaining(data.remaining);
      setIgniteLimit(data.limit);
      setIsAdmin(data.isAdmin ?? false);
      if (data.remaining === 0 && !data.isAdmin && !localStorage.getItem("enjo_feedback_sent")) {
        setShowFeedback(true);
      }
    }
  }

  async function fetchPostRemaining(handle: string) {
    const res = await fetch(`/api/post?handle=${encodeURIComponent(handle)}`);
    if (res.ok) {
      const data = await res.json();
      setPostRemaining(data.remaining);
    }
  }

  async function loadPosts() {
    const { data, error: err } = await supabase
      .from("posts")
      .select("*")
      .or("type.is.null,type.eq.news")
      .order("created_at", { ascending: false })
      .limit(50);
    if (err) console.error("load error:", err);
    if (data) {
      const handle = userRef.current?.handle;
      const filtered = (data as DBRow[]).filter(
        (r) =>
          r.handle === handle ||
          r.flame_state === "ignited" ||
          r.flame_state === "apologized" ||
          r.type === "news"
      );
      const sorted = insertNewsInOrder(filtered.map((r) => fromDB(r, handle)));
      setPosts(sorted);
    }
  }

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  // プルトゥリフレッシュ
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        pullStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;
      const dy = e.touches[0].clientY - pullStartY.current;
      if (dy > 0) {
        const clamped = Math.min(dy * 0.45, PULL_THRESHOLD + 15);
        pullYRef.current = clamped;
        setPullY(clamped);
      }
    };
    const onTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      if (pullYRef.current >= PULL_THRESHOLD) handleRefresh();
      pullYRef.current = 0;
      setPullY(0);
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ユーザー読み込み
  useEffect(() => {
    const welcomeSeen = localStorage.getItem("enjo_welcome_seen");
    if (!welcomeSeen) {
      setShowWelcome(true);
      return;
    }
    const stored = localStorage.getItem("enjo_user");
    if (stored) {
      const u = JSON.parse(stored) as LocalUser;
      setUser(u);
      userRef.current = u;
      fetchIgniteRemaining(u.handle);
      fetchPostRemaining(u.handle);
    } else {
      setShowSetup(true);
    }
  }, []);

  // 初期投稿読み込み
  useEffect(() => {
    loadPosts().finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // リアルタイム購読
  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const row = payload.new as DBRow;
          if (row.type === "registration" || row.type === "deleted") return;
          const isOwn = row.handle === userRef.current?.handle;
          const isIgnited = row.flame_state === "ignited" || row.flame_state === "apologized";
          const isNews = row.type === "news";
          if (!isOwn && !isIgnited && !isNews) return;
          const newPost = fromDB(row, userRef.current?.handle);
          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) return prev;
            if (newPost.type === "news" && newPost.targetPostId) {
              const idx = prev.findIndex((p) => p.id === newPost.targetPostId);
              if (idx !== -1) {
                const next = [...prev];
                next.splice(idx + 1, 0, newPost);
                return next;
              }
            }
            return [newPost, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          const row = payload.new as DBRow;
          if (row.type === "deleted") {
            setPosts((prev) => prev.filter((p) => p.id !== row.id));
            return;
          }
          const updated = fromDB(row, userRef.current?.handle);
          setPosts((prev) => {
            const exists = prev.some((p) => p.id === updated.id);
            if (!exists) {
              if (updated.flameState === "ignited" || updated.flameState === "apologized") {
                return [updated, ...prev];
              }
              return prev;
            }
            return prev.map((p) =>
              p.id === updated.id && p.flameState !== "igniting" ? updated : p
            );
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function insertNewsInOrder(list: PostState[]): PostState[] {
    const news = list.filter((p) => p.type === "news");
    const rest = list.filter((p) => p.type !== "news");
    const result = [...rest];
    for (const n of news) {
      const idx = result.findIndex((p) => p.id === n.targetPostId);
      if (idx !== -1) result.splice(idx + 1, 0, n);
      else result.push(n);
    }
    return result;
  }

  function handleWelcomeClose() {
    localStorage.setItem("enjo_welcome_seen", "1");
    setShowWelcome(false);
    const stored = localStorage.getItem("enjo_user");
    if (stored) {
      const u = JSON.parse(stored) as LocalUser;
      setUser(u);
      userRef.current = u;
      fetchIgniteRemaining(u.handle);
      fetchPostRemaining(u.handle);
    } else {
      setShowSetup(true);
    }
  }

  function handleUserSave(u: LocalUser) {
    setUser(u);
    userRef.current = u;
    setShowSetup(false);
    fetchIgniteRemaining(u.handle);
    fetchPostRemaining(u.handle);
  }

  async function addPost(content: string) {
    const u = user;
    if (!u) { setShowSetup(true); return; }
    const id = crypto.randomUUID();
    const newPost: PostState = {
      id,
      username: u.username,
      handle: u.handle,
      avatar: u.avatar,
      content,
      timestamp: "今",
      likes: 0,
      reposts: 0,
      flameState: "normal",
      isOwn: true,
    };
    setPosts((prev) => [newPost, ...prev]);
    const res = await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handle: u.handle, username: u.username, avatar: u.avatar, content }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setError(body.error ?? "投稿の保存に失敗しました");
    } else {
      const data = await res.json();
      setPostRemaining(data.remaining);
    }
  }

  async function ignitePost(id: string) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, flameState: "igniting" as const } : p))
    );

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
        prev.map((p) =>
          p.id === id ? { ...p, flameState: "ignited" as const, flameResult: data } : p
        )
      );

      setIgniteRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));

      await supabase.from("posts").update({
        flame_state: "ignited",
        flame_result: data,
      }).eq("id", id);

      if (data.flameScore >= NEWS_THRESHOLD) {
        fetchNews(id, post.content, data);
      }
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, flameState: "normal" as const } : p))
      );
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      if (userRef.current) fetchIgniteRemaining(userRef.current.handle);
    }
  }

  async function fetchNews(targetId: string, postContent: string, igniteData: IgniteResult) {
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: postContent,
          flameScore: igniteData.flameScore,
          comments: igniteData.comments,
          summary: igniteData.summary,
        }),
      });
      if (!res.ok) return;
      const news: NewsData = await res.json();
      const newsId = `news-${targetId}`;
      const newsPost: PostState = {
        id: newsId,
        type: "news",
        username: news.outlet,
        handle: news.handle,
        avatar: "📰",
        content: news.body,
        timestamp: "たった今",
        likes: Math.round(igniteData.flameScore * 22),
        reposts: Math.round(igniteData.flameScore * 35),
        flameState: "normal",
        newsData: news,
        targetPostId: targetId,
      };

      // ローカル反映
      setPosts((prev) => {
        if (prev.some((p) => p.id === newsId)) return prev;
        const idx = prev.findIndex((p) => p.id === targetId);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx + 1, 0, newsPost);
        return next;
      });

      // DB保存（他ユーザーへのリアルタイム配信）
      await supabase.from("posts").insert({
        id: newsId,
        type: "news",
        username: news.outlet,
        handle: news.handle,
        avatar: "📰",
        content: news.body,
        likes: newsPost.likes,
        reposts: newsPost.reposts,
        flame_state: "normal",
        news_data: news,
        target_post_id: targetId,
      }).then(({ error: e }) => { if (e) console.error("news insert:", e); });
    } catch {
      // 無視
    }
  }

  async function deletePost(id: string) {
    const handle = userRef.current?.handle;
    if (!handle) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handle }),
    });
  }

  async function apologizePost(id: string, apology: string): Promise<void> {
    const post = posts.find((p) => p.id === id);
    if (!post?.flameResult) return;

    const res = await fetch("/api/apologize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: post.content,
        apology,
        flameScore: post.flameResult.flameScore,
      }),
    });
    if (!res.ok) throw new Error("謝罪の採点に失敗しました");
    const data: ApologyResult = await res.json();

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, flameState: "apologized" as const, apologyResult: data } : p
      )
    );

    await supabase.from("posts").update({
      flame_state: "apologized",
      apology_result: data,
    }).eq("id", id);
  }

  const ranking: RankingEntry[] = posts
    .filter((p) => p.type !== "news" && (p.flameState === "ignited" || p.flameState === "apologized") && p.flameResult)
    .sort((a, b) => (b.flameResult!.flameScore) - (a.flameResult!.flameScore))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      avatar: p.avatar,
      username: p.username,
      content: p.content,
      flameScore: p.flameResult!.flameScore,
      succeeded: p.apologyResult?.succeeded,
    }));

  return (
    <>
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      {showSetup && <UserSetupModal onSave={handleUserSave} />}
      {showFeedback && user && (
        <FeedbackModal
          handle={user.handle}
          username={user.username}
          onClose={() => setShowFeedback(false)}
        />
      )}
      <XLayout user={user} ranking={ranking}>
        {error && (
          <div className="mx-4 mt-2 bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
            <button className="ml-3 underline text-red-400" onClick={() => setError(null)}>
              閉じる
            </button>
          </div>
        )}
        {/* プルトゥリフレッシュインジケーター */}
        <div
          className="overflow-hidden transition-all duration-200 flex items-center justify-center text-sm text-gray-400 gap-2"
          style={{ height: refreshing ? 44 : pullY > 0 ? Math.min(pullY, 44) : 0 }}
        >
          {refreshing ? (
            <svg className="w-4 h-4 animate-spin text-orange-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-gray-500 transition-transform duration-200"
              style={{ transform: pullY >= PULL_THRESHOLD ? "rotate(180deg)" : `rotate(${(pullY / PULL_THRESHOLD) * 180}deg)` }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          )}
          <span>{refreshing ? "更新中..." : pullY >= PULL_THRESHOLD ? "離して更新" : "引っ張って更新"}</span>
        </div>
        <ComposeBox onSubmit={addPost} user={user} onNeedUser={() => setShowSetup(true)} postRemaining={postRemaining} />
        {user && igniteRemaining !== null && (
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2.5 text-xs text-gray-500">
            <span>炎上残り</span>
            <div className="flex gap-1">
              {Array.from({ length: igniteLimit }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < igniteRemaining ? "bg-orange-500" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <span className={igniteRemaining === 0 ? "text-red-400" : igniteRemaining <= 2 ? "text-orange-400" : "text-gray-500"}>
              {igniteRemaining}/{igniteLimit}回
            </span>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-12 text-gray-500 text-sm">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="flex justify-center py-12 text-gray-500 text-sm">
            まだ投稿がありません。最初の投稿をどうぞ🔥
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {posts.map((post) =>
              post.type === "news" ? (
                <NewsCard key={post.id} post={post} />
              ) : (
                <PostCard
                  key={post.id}
                  post={post}
                  onIgnite={() => ignitePost(post.id)}
                  onApologize={(text) => apologizePost(post.id, text)}
                  onDelete={() => deletePost(post.id)}
                  igniteRemaining={igniteRemaining ?? undefined}
                  isAdmin={isAdmin}
                />
              )
            )}
          </div>
        )}
      </XLayout>
    </>
  );
}
