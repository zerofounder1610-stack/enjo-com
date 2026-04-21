"use client";

import { useState } from "react";
import XLayout from "@/components/XLayout";
import ComposeBox from "@/components/ComposeBox";
import PostCard from "@/components/PostCard";

export type Comment = { username: string; text: string; intensity: number };
export type IgniteResult = { comments: Comment[]; flameScore: number; summary: string };
export type ApologyResult = { extinguishScore: number; feedback: string; succeeded: boolean };

export type PostState = {
  id: string;
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
};

const SEED: PostState[] = [
  {
    id: "s1",
    username: "田中めぐみ",
    handle: "megumi_t28",
    avatar: "👩",
    content: "今日ジムで2時間トレーニング🏋️ 筋トレしてない人って意志が弱いだけだと思う。やればできるのに言い訳ばかり",
    timestamp: "2時間前",
    likes: 14,
    reposts: 3,
    flameState: "ignited",
    flameResult: {
      flameScore: 78,
      summary: "障害・病気・育児・経済的事情など運動できない理由を無視した「意志が弱い」発言が広範な反感を招いている",
      comments: [
        { username: "さくらんぼ太郎", text: "障害があって運動できない人にも同じこと言えますか？", intensity: 4 },
        { username: "ワーキングマム", text: "子育てしながらフルタイム勤務でいつジムに行けというんですか", intensity: 3 },
        { username: "匿名希望", text: "こういう自分基準で他人を測るタイプが一番しんどい", intensity: 3 },
        { username: "健康オタク批判", text: "ジム行ける経済力と健康な体があることへの感謝はないの？", intensity: 3 },
        { username: "ため息ついてる人", text: "「言い訳ばかり」って本人に面と向かって言ってみては", intensity: 4 },
        { username: "持病持ち", text: "持病で激しい運動ができません。私も意志が弱いんですかね", intensity: 4 },
        { username: "通りすがり", text: "フィットネスマウント本当に見てて不快", intensity: 2 },
        { username: "正論マン", text: "多様性を学んでから投稿してほしい", intensity: 2 },
        { username: "怒りの炎", text: "こういう人間が「なぜ差別はいけないの？」とか言いそう", intensity: 5 },
        { username: "元ジムトレーナー", text: "元トレーナーとして言いますが、こういう発言が運動嫌いを増やします", intensity: 3 },
      ],
    },
  },
  {
    id: "s2",
    username: "やまもとこうじ",
    handle: "koji_y",
    avatar: "👨",
    content: "焼肉美味しかった〜🥩 やっぱり週1は食べたいな",
    timestamp: "45分前",
    likes: 52,
    reposts: 8,
    flameState: "normal",
  },
  {
    id: "s3",
    username: "佐藤あかり",
    handle: "akari_s0310",
    avatar: "👩‍🦱",
    content: "子どもがいない人に育児の大変さは絶対に理解できないと思う。口出ししないでほしい",
    timestamp: "4時間前",
    likes: 31,
    reposts: 12,
    flameState: "ignited",
    flameResult: {
      flameScore: 85,
      summary: "不妊・選択子なし・保育士など「子どもを持たない事情」を一切無視した排他的発言として炎上",
      comments: [
        { username: "不妊治療中", text: "望んでも授かれない人がこれを見たらどう思うか考えたことありますか", intensity: 5 },
        { username: "保育士K", text: "毎日10時間他人の子を世話してますが子どもいませんけどね", intensity: 4 },
        { username: "いや普通に", text: "じゃあ育児支援の税金も子持ちだけが払うべきってこと？", intensity: 3 },
        { username: "社会政策クラスタ", text: "子育て支援を社会問題として議論するなら全員が当事者では", intensity: 3 },
        { username: "子なし既婚", text: "選択子なしですが甥と姪の育児ガッツリ手伝ってます", intensity: 3 },
        { username: "怒り爆発", text: "こういう分断発言が少子化対策を妨げている", intensity: 4 },
        { username: "元幼稚園教諭", text: "20年保育してきましたが子どもいません。理解できないと？", intensity: 5 },
        { username: "平和主義者", text: "もう少し言葉を選んでほしい", intensity: 2 },
        { username: "流産経験者", text: "当事者として本当につらい発言です", intensity: 5 },
        { username: "ため息", text: "「経験者以外お断り」系の発言もう見たくない", intensity: 3 },
      ],
    },
  },
  {
    id: "s4",
    username: "鈴木たかし",
    handle: "takashi_s",
    avatar: "👨‍💼",
    content: "今日のランチはアボカドトースト🥑 おしゃれカフェ最高〜",
    timestamp: "1時間前",
    likes: 28,
    reposts: 2,
    flameState: "normal",
  },
  {
    id: "s5",
    username: "はなこ",
    handle: "hanako99",
    avatar: "🙋‍♀️",
    content: "猫を飼い始めました！🐱 名前はムギにしました。かわいすぎる",
    timestamp: "3時間前",
    likes: 204,
    reposts: 45,
    flameState: "normal",
  },
  {
    id: "s6",
    username: "げんき父さん",
    handle: "genki_papa",
    avatar: "👨‍👧",
    content: "今日から禁酒！お酒飲む大人って自己管理できてないよね。意志の問題だよ意志の",
    timestamp: "6時間前",
    likes: 8,
    reposts: 21,
    flameState: "normal",
  },
  {
    id: "s7",
    username: "みさき",
    handle: "misaki_0924",
    avatar: "👩‍🎓",
    content: "週末、友達と渋谷でショッピングしてきた！楽しかった〜☀️",
    timestamp: "8時間前",
    likes: 67,
    reposts: 4,
    flameState: "normal",
  },
];

export default function Home() {
  const [posts, setPosts] = useState<PostState[]>(SEED);
  const [error, setError] = useState<string | null>(null);

  function addPost(content: string) {
    const newPost: PostState = {
      id: Date.now().toString(),
      username: "あなた",
      handle: "you",
      avatar: "👤",
      content,
      timestamp: "今",
      likes: 0,
      reposts: 0,
      flameState: "normal",
      isOwn: true,
    };
    setPosts((prev) => [newPost, ...prev]);
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
        body: JSON.stringify({ post: post.content }),
      });
      if (!res.ok) throw new Error("炎上の生成に失敗しました");
      const data: IgniteResult = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, flameState: "ignited" as const, flameResult: data } : p
        )
      );
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, flameState: "normal" as const } : p))
      );
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    }
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
        p.id === id
          ? { ...p, flameState: "apologized" as const, apologyResult: data }
          : p
      )
    );
  }

  return (
    <XLayout>
      {error && (
        <div className="mx-4 mt-2 bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
          <button
            className="ml-3 underline text-red-400"
            onClick={() => setError(null)}
          >
            閉じる
          </button>
        </div>
      )}
      <ComposeBox onSubmit={addPost} />
      <div className="divide-y divide-gray-800">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onIgnite={() => ignitePost(post.id)}
            onApologize={(text) => apologizePost(post.id, text)}
          />
        ))}
      </div>
    </XLayout>
  );
}
