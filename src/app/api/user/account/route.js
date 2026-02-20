import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import WeightLog from "@/models/WeightLog";
import BloodPressureLog from "@/models/BloodPressureLog";
import GlucoseLog from "@/models/GlucoseLog";

export async function DELETE(request) {
  try {
    const user = await requireAuth(request);
    await connectMongo();

    const userId = user._id;

    await Promise.all([
      WeightLog.deleteMany({ userId }),
      BloodPressureLog.deleteMany({ userId }),
      GlucoseLog.deleteMany({ userId }),
    ]);

    await User.deleteOne({ _id: userId });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status }
    );
  }
}
