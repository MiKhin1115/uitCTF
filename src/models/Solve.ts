import mongoose, { Schema, models, model, Types } from "mongoose";

export type ISolve = {
  userId: Types.ObjectId;
  teamId: Types.ObjectId;
  challengeId: Types.ObjectId;

  // ✅ points earned (event only)
  points: number;

  // ✅ which event this solve belongs to
  eventId: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
};

const SolveSchema = new Schema<ISolve>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },

    points: { type: Number, required: true },

    // ✅ IMPORTANT
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  },
  { timestamps: true }
);

// ✅ team can solve a challenge once per event
SolveSchema.index({ teamId: 1, challengeId: 1, eventId: 1 }, { unique: true });

export const Solve = models.Solve || model<ISolve>("Solve", SolveSchema);
