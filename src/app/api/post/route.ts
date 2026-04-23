import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const POST_LIMIT = 5;

const ADMIN_HANDLES = (process.env.ADMIN_HANDLES ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

async function getPostCount(handle: string): Promise<number> {
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("handle", handle)
    .is("type", null);
  return count ?? 0;
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ remaining: POST_LIMIT, limit: POST_LIMIT });
  if (ADMIN_HANDLES.includes(handle.toLowerCase())) {
    return NextResponse.json({ remaining: 999, limit: POST_LIMIT });
  }
  const used = await getPostCount(handle);
  return NextResponse.json({ used, remaining: Math.max(0, POST_LIMIT - used), limit: POST_LIMIT });
}

export async function POST(req: NextRequest) {
  const { id, handle, username, avatar, content } = await req.json();

  if (!content || !handle || !id) {
    return NextResponse.json({ error: "パラメータが不正です" }, { status: 400 });
  }

  if (!ADMIN_HANDLES.includes(handle.toLowerCase())) {
    const used = await getPostCount(handle);
    if (used >= POST_LIMIT) {
      return NextResponse.json(
        { error: `投稿できるのは${POST_LIMIT}回までです` },
        { status: 429 }
      );
    }
  }

  const { error } = await supabase.from("posts").insert({
    id,
    username,
    handle,
    avatar,
    content,
    likes: 0,
    reposts: 0,
    flame_state: "normal",
  });

  if (error) {
    return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
  }

  const used = await getPostCount(handle);
  return NextResponse.json({ ok: true, remaining: Math.max(0, POST_LIMIT - used) });
}
