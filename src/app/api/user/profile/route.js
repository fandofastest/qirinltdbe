import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
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

export async function PUT(request) {
  try {
    const authed = await requireAuth(request);
    const body = await request.json();
    const { name, password } = body || {};

    await connectMongo();

    const update = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof password === "string" && password) update.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(authed._id, update, { new: true }).select("-password");

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status }
    );
  }
}
