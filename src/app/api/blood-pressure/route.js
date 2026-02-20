import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import BloodPressureLog from "@/models/BloodPressureLog";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { systolic, diastolic, pulse, date } = body || {};

    if (
      typeof systolic !== "number" ||
      typeof diastolic !== "number" ||
      typeof pulse !== "number" ||
      !date
    ) {
      return NextResponse.json(
        { success: false, message: "systolic, diastolic, pulse (numbers) and date are required" },
        { status: 400 }
      );
    }

    await connectMongo();
    const log = await BloodPressureLog.create({
      userId: user._id,
      systolic,
      diastolic,
      pulse,
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

    const logs = await BloodPressureLog.find({ userId: user._id }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json({ success: false, message: err?.message || "Server error" }, { status });
  }
}
