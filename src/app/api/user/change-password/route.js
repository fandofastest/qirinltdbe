import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";

export async function PUT(request) {
  try {
    const authed = await requireAuth(request);
    const body = await request.json();
    const { currentPassword, newPassword } = body || {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "currentPassword and newPassword are required" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "newPassword must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectMongo();

    const user = await User.findById(authed._id);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({
      success: true,
      data: { changed: true },
    });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status }
    );
  }
}
