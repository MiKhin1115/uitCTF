import mongoose, { Schema, models, model } from "mongoose";

export type IPracticeSolve = {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

const PracticeSolveSchema = new Schema<IPracticeSolve>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    challengeId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "Challenge" },
  },
  { timestamps: true }
);

// ✅ user can practice-solve a challenge once
PracticeSolveSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const PracticeSolve =
  models.PracticeSolve || model<IPracticeSolve>("PracticeSolve", PracticeSolveSchema);
