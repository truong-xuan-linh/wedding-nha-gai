import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bride_blessings")
    .select("id, name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Supabase blessings GET error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu" }, { status: 500 });
  }

  return NextResponse.json({ blessings: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, message } = body as { name: string; message: string };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Lời chúc không được để trống" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("bride_blessings").insert({
    name: name?.trim() || "Ẩn danh",
    message: message.trim(),
  });

  if (error) {
    console.error("Supabase blessings POST error:", error);
    return NextResponse.json({ error: "Lỗi lưu dữ liệu" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
