import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const USER_LIMIT = 50;

export async function POST(req: NextRequest) {
  const { handle, username, avatar } = await req.json();

  if (!handle || !username || !avatar) {
    return NextResponse.json({ error: "パラメータが不正です" }, { status: 400 });
  }

  // すでに登録済みなら通す
  const { data: existing } = await supabase
    .from("posts")
    .select("handle")
    .eq("type", "registration")
    .eq("handle", handle)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true });
  }

  // 登録人数チェック
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("type", "registration");

  if ((count ?? 0) >= USER_LIMIT) {
    return NextResponse.json(
      { error: "参加者が満員になりました🙏 またの機会にご参加ください！" },
      { status: 403 }
    );
  }

  // postsテーブルに登録レコードを挿入（タイムラインには表示されない）
  const { error } = await supabase.from("posts").insert({
    id: crypto.randomUUID(),
    type: "registration",
    handle,
    username,
    avatar,
    content: "",
    likes: 0,
    reposts: 0,
    flame_state: "normal",
  });

  if (error) {
    console.error("register error:", JSON.stringify(error));
    return NextResponse.json({ error: `登録に失敗しました: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
