import mongoose, { Schema, models } from "mongoose";

const MemberSchema = new Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  { _id: false }
);

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    ownerId: { type: String, required: true },

    // 🔐 team password (hashed)
    passwordHash: { type: String, required: true },

    // 🎟 invitation token to join
    inviteToken: { type: String, required: true, unique: true },

    members: { type: [MemberSchema], default: [] },
  },
  { timestamps: true }
);

export const Team = models.Team || mongoose.model("Team", TeamSchema);
