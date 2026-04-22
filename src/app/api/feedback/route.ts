import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_HANDLES = (process.env.ADMIN_HANDLES ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  const { handle, username, stars, comment } = await req.json();

  if (!handle || !stars) {
    return NextResponse.json({ error: "パラメータが不正です" }, { status: 400 });
  }

  const { error } = await supabase.from("posts").insert({
    id: crypto.randomUUID(),
    type: "feedback",
    handle,
    username: username ?? handle,
    avatar: "📝",
    content: JSON.stringify({ stars, comment: comment ?? "" }),
    likes: 0,
    reposts: 0,
    flame_state: "normal",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");

  if (!handle || !ADMIN_HANDLES.includes(handle.toLowerCase())) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("handle, username, content, created_at")
    .eq("type", "feedback")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const feedbacks = (data ?? []).map((row) => {
    try {
      const parsed = JSON.parse(row.content);
      return { handle: row.handle, username: row.username, stars: parsed.stars, comment: parsed.comment, created_at: row.created_at };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return NextResponse.json({ feedbacks });
}
