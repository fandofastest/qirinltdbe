import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    const status = err?.status || 401;
    return NextResponse.json({ success: false, message: err?.message || "Unauthorized" }, { status });
  }
}
