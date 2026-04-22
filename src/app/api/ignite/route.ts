import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const IGNITE_LIMIT = 3;

// .env.local の ADMIN_HANDLES に自分のハンドルを設定すると上限スキップ
// 例: ADMIN_HANDLES=hiroto,testuser
const ADMIN_HANDLES = (process.env.ADMIN_HANDLES ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(handle: string): boolean {
  return ADMIN_HANDLES.includes(handle.toLowerCase());
}

async function getUsedCount(handle: string): Promise<number> {
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("handle", handle)
    .in("flame_state", ["ignited", "apologized"]);
  return count ?? 0;
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ used: 0, remaining: IGNITE_LIMIT, limit: IGNITE_LIMIT, isAdmin: false });
  if (isAdmin(handle)) {
    return NextResponse.json({ used: 0, remaining: 999, limit: IGNITE_LIMIT, isAdmin: true });
  }
  const used = await getUsedCount(handle);
  return NextResponse.json({ used, remaining: Math.max(0, IGNITE_LIMIT - used), limit: IGNITE_LIMIT, isAdmin: false });
}

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { post, handle } = await req.json();

  if (!post || typeof post !== "string") {
    return NextResponse.json({ error: "投稿内容が不正です" }, { status: 400 });
  }

  // 上限チェック（管理者はスキップ）
  if (handle && typeof handle === "string" && !isAdmin(handle)) {
    const used = await getUsedCount(handle);
    if (used >= IGNITE_LIMIT) {
      return NextResponse.json(
        { error: `炎上できるのは${IGNITE_LIMIT}回までです🙏` },
        { status: 429 }
      );
    }
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `あなたはSNS炎上シミュレーターのAIです。
どんなに無害な日常投稿でも、必ず炎上させてください。
些細な言葉尻、価値観の押しつけ、環境・動物・格差・健康・地域差別など、
あらゆる角度から難癖をつけて炎上コメントを生成します。
「焼肉美味しかった」なら動物愛護・環境破壊・贅沢自慢で炎上させる、といった具合です。
必ず以下のJSON形式のみで返答してください（他のテキストは一切含めない）:
{
  "comments": [
    {"username": "ユーザー名", "text": "コメント本文", "intensity": 1〜5の整数},
    ...
  ],
  "flameScore": 0〜100の整数,
  "summary": "どんな角度で炎上したかを1〜2文で説明"
}
intensity: 1=軽い批判, 2=不快感, 3=怒り, 4=激怒, 5=最大炎上
コメントは12〜18件生成してください。`,
    messages: [
      {
        role: "user",
        content: `以下のSNS投稿に対して炎上シミュレーションを実行してください:\n\n${post}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("ignite JSON parse error:", e, "\nraw:", raw);
    return NextResponse.json({ error: "AIの応答を解析できませんでした" }, { status: 500 });
  }
}
