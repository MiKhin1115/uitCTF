import mongoose, { Schema, type Model } from "mongoose";

export type ChallengeCategory =
  | "Web Exploitation"
  | "Cryptography"
  | "Forensics"
  | "Pwn"
  | "Reverse Engineering"
  | "OSINT"
  | "Misc"
  | "Steganography";

export interface IChallengeFile {
  fileId: string;       // GridFS file ObjectId as string
  filename: string;
  contentType: string;
  size: number;
}

export interface IChallenge {
  title: string;
  description: string;
  points: number;
  category: ChallengeCategory;
  flagHash: string;      // ✅ store hashed flag
  files: IChallengeFile[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ChallengeFileSchema = new Schema<IChallengeFile>(
  {
    fileId: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const ChallengeSchema = new Schema<IChallenge>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        "Web Exploitation",
        "Cryptography",
        "Forensics",
        "Pwn",
        "Reverse Engineering",
        "OSINT",
        "Misc",
        "Steganography",
      ],
    },
    flagHash: { type: String, required: true, select: false }, // ✅ not returned unless explicitly selected
    files: { type: [ChallengeFileSchema], default: [] },
  },
  { timestamps: true }
);

ChallengeSchema.index({ category: 1, points: 1 });

export const Challenge: Model<IChallenge> =
  mongoose.models.Challenge || mongoose.model<IChallenge>("Challenge", ChallengeSchema);
