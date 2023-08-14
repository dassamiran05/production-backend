import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 500 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
