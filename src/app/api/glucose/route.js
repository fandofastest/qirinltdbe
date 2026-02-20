import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import GlucoseLog from "@/models/GlucoseLog";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { glucoseLevel, date } = body || {};

    if (typeof glucoseLevel !== "number" || !date) {
      return NextResponse.json(
        { success: false, message: "glucoseLevel (number) and date are required" },
        { status: 400 }
      );
    }

    await connectMongo();
    const log = await GlucoseLog.create({
      userId: user._id,
      glucoseLevel,
      date: new Date(date),
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json({ success: false, message: err?.message || "Server error" }, { status });
  }
}

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    await connectMongo();

    const logs = await GlucoseLog.find({ userId: user._id }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json({ success: false, message: err?.message || "Server error" }, { status });
  }
}
