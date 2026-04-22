import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { post, apology, flameScore } = await req.json();
  if (!post || !apology || typeof flameScore !== "number") {
    return NextResponse.json({ error: "パラメータが不正です" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `あなたはSNS炎上シミュレーターの謝罪採点AIです。
炎上した投稿と、ユーザーが書いた謝罪文を受け取り、謝罪の質を採点します。
必ず以下のJSON形式のみで返答してください（他のテキストは一切含めない）:
{
  "extinguishScore": 0〜100の整数,
  "feedback": "謝罪の評価コメント（2〜3文）",
  "succeeded": true or false
}
採点基準:
- 誠実さ（言い訳をしていないか）
- 具体性（何が問題だったか認識しているか）
- 反省の深さ
extinguishScore >= 60 かつ flameScore - extinguishScore <= 40 の場合 succeeded: true`,
    messages: [
      {
        role: "user",
        content: `炎上した投稿（炎上スコア: ${flameScore}点）:\n${post}\n\n謝罪文:\n${apology}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("apologize JSON parse error:", e, "\nraw:", raw);
    return NextResponse.json({ error: "AIの応答を解析できませんでした" }, { status: 500 });
  }
}
