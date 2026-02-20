import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import WeightLog from "@/models/WeightLog";
import BloodPressureLog from "@/models/BloodPressureLog";
import GlucoseLog from "@/models/GlucoseLog";

export async function GET(request) {
  try {
    await requireAdmin(request);
    await connectMongo();

    const [totalUsers, totalWeightLogs, totalBloodPressureLogs, totalGlucoseLogs] = await Promise.all([
      User.countDocuments({}),
      WeightLog.countDocuments({}),
      BloodPressureLog.countDocuments({}),
      GlucoseLog.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalWeightLogs,
        totalBloodPressureLogs,
        totalGlucoseLogs,
      },
    });
  } catch (err) {
    const status = err?.status || 403;
    return NextResponse.json(
      { success: false, message: err?.message || "Forbidden" },
      { status }
    );
  }
}
