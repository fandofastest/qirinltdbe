import mongoose from "mongoose";

const WeightLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weight: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.WeightLog || mongoose.model("WeightLog", WeightLogSchema);
