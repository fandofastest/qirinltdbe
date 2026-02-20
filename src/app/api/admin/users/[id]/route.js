import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = params || {};

    await connectMongo();
    const exists = await User.findById(id);
    if (!exists) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    await User.deleteOne({ _id: id });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err) {
    const status = err?.status || 403;
    return NextResponse.json({ success: false, message: err?.message || "Forbidden" }, { status });
  }
}
