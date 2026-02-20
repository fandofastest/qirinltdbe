import mongoose from "mongoose";

const GlucoseLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    glucoseLevel: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.GlucoseLog || mongoose.model("GlucoseLog", GlucoseLogSchema);
