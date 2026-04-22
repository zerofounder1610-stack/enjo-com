import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { post, flameScore, comments, summary } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `あなたは日本のネットニュース・まとめサイトの記者AIです。
SNSで炎上した投稿についての記事を書いてください。
実際の炎上ニュース記事の構成に従ってください：
1. 炎上した投稿の概要と経緯
2. なぜ批判が集まったかの分析
3. 代表的なリアクション・コメントの引用（2〜3件）
4. 現在の拡散状況

架空のネットメディア名を使ってください（例：ネットニュースNOW、バイラルJP、SNS速報など）。
必ず以下のJSON形式のみで返答してください（他のテキストは一切含めない）:
{
  "outlet": "メディア名",
  "handle": "メディアの@ハンドル（英数字）",
  "headline": "見出し（30〜50文字）",
  "body": "記事本文（200〜280文字）",
  "tags": ["タグ1", "タグ2", "タグ3"]
}`,
    messages: [
      {
        role: "user",
        content: `以下の炎上案件についてのニュース記事を作成してください。

【炎上した投稿】
${post}

【炎上スコア】${flameScore}点

【炎上の概要】
${summary}

【主なコメント】
${comments
  .slice(0, 5)
  .map((c: { username: string; text: string }) => `・${c.username}「${c.text}」`)
  .join("\n")}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("news JSON parse error:", e, "\nraw:", raw);
    return NextResponse.json({ error: "記事の生成に失敗しました" }, { status: 500 });
  }
}
