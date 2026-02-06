import mongoose, { Schema, models, model, Types } from "mongoose";

export type ChallengeCategory =
  | "Web Exploitation"
  | "Cryptography"
  | "Forensics"
  | "Pwn"
  | "Reverse Engineering"
  | "OSINT"
  | "Misc"
  | "Steganography";

export type ChallengeFile = {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
};

export type IChallenge = {
  // ✅ link to which event this challenge belongs to
  eventId: Types.ObjectId;

  title: string;
  category: ChallengeCategory;
  description: string;
  points: number;
  flagHash: string;

  // ✅ schedule window
  startsAt: Date;
  endsAt: Date;

  files: ChallengeFile[];

  createdAt?: Date;
  updatedAt?: Date;
};

const ChallengeSchema = new Schema<IChallenge>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },

    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    points: { type: Number, required: true },
    flagHash: { type: String, required: true },

    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },

    files: [
      {
        fileId: { type: String, required: true },
        filename: { type: String, required: true },
        contentType: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Challenge =
  models.Challenge || model<IChallenge>("Challenge", ChallengeSchema);
