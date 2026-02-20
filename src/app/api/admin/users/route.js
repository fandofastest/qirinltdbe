import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    await requireAdmin(request);
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments({}),
      User.find({}).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        page,
        limit,
        users,
      },
    });
  } catch (err) {
    const status = err?.status || 403;
    return NextResponse.json({ success: false, message: err?.message || "Forbidden" }, { status });
  }
}
