import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_HANDLES = (process.env.ADMIN_HANDLES ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  const { id, handle } = await req.json();

  if (!id || !handle) {
    return NextResponse.json({ error: "パラメータが不正です" }, { status: 400 });
  }

  const isAdmin = ADMIN_HANDLES.includes(handle.toLowerCase());

  // 管理者でない場合は投稿の所有者チェック
  if (!isAdmin) {
    const { data: post } = await supabase
      .from("posts")
      .select("handle")
      .eq("id", id)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }
    if (post.handle !== handle) {
      return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
    }
  }

  const { error } = await supabase
    .from("posts")
    .update({ type: "deleted" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
