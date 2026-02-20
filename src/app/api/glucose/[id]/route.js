import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import GlucoseLog from "@/models/GlucoseLog";
import { requireAuth } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = params || {};

    await connectMongo();
    const log = await GlucoseLog.findById(id);

    if (!log) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    if (log.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await GlucoseLog.deleteOne({ _id: id });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err) {
    const status = err?.status || 500;
    return NextResponse.json({ success: false, message: err?.message || "Server error" }, { status });
  }
}
