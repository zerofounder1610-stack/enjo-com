import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { post } = await req.json();
  if (!post || typeof post !== "string") {
    return NextResponse.json({ error: "投稿内容が不正です" }, { status: 400 });
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
