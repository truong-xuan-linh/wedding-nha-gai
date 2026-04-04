import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, attending, attendee_count } = body as {
    name: string;
    attending: boolean;
    attendee_count: number;
  };

  if (typeof attending !== "boolean") {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("bride_rsvp").insert({
    name: name || "Ẩn danh",
    attending,
    attendee_count: attendee_count ?? 1,
  });

  if (error) {
    console.error("Supabase RSVP error:", error);
    return NextResponse.json({ error: "Lỗi lưu dữ liệu" }, { status: 500 });
  }

  // Send notification email to the couple
  const attendingText = attending ? "SẼ THAM DỰ" : "KHÔNG THỂ THAM DỰ";
  const guestName = name || "Ẩn danh";

  try {
    await transporter.sendMail({
      from: `"Wedding Nhà Gái" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `[Xác nhận tham dự] ${guestName} – ${attendingText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #5c5c5c; text-align: center;">💍 Xác Nhận Tham Dự Đám Cưới</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px; color: #888; width: 140px;">Họ và tên:</td>
              <td style="padding: 8px; font-weight: bold;">${guestName}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; color: #888;">Tham dự:</td>
              <td style="padding: 8px; font-weight: bold; color: ${attending ? "#4caf50" : "#e53935"};">${attendingText}</td>
            </tr>
            ${
              attending
                ? `<tr>
              <td style="padding: 8px; color: #888;">Số người:</td>
              <td style="padding: 8px; font-weight: bold;">${attendee_count ?? 1} người</td>
            </tr>`
                : ""
            }
          </table>
          <p style="margin-top: 24px; color: #aaa; font-size: 12px; text-align: center;">Thông báo tự động từ trang thiệp cưới</p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.error("Email send error:", mailErr);
    // Don't fail the request if email fails
  }

  return NextResponse.json({ success: true });
}
