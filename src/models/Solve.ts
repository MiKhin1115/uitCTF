import mongoose, { Schema, type Model } from "mongoose";

export interface ISolve {
  userId: string;       // User._id
  challengeId: string;  // Challenge._id
  createdAt?: Date;
  updatedAt?: Date;
}

const SolveSchema = new Schema<ISolve>(
  {
    userId: { type: String, required: true, index: true },
    challengeId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// one solve per user per challenge
SolveSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const Solve: Model<ISolve> =
  mongoose.models.Solve || mongoose.model<ISolve>("Solve", SolveSchema);
