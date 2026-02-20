import mongoose from "mongoose";

const BloodPressureLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    systolic: { type: Number, required: true },
    diastolic: { type: Number, required: true },
    pulse: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.BloodPressureLog || mongoose.model("BloodPressureLog", BloodPressureLogSchema);
