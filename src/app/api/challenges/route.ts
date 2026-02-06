import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const { session, denied } = await requireUser();
  if (denied) return denied;

  await connectMongo();

  const challenges = await Challenge.find()
    .select("_id title description points category files createdAt")
    .sort({ category: 1, points: 1 });

  const solves = await Solve.find({ userId: session!.id }).select("challengeId");
  const solvedSet = new Set(solves.map((s) => s.challengeId));

  const result = challenges.map((c) => ({
    ...c.toObject(),
    solved: solvedSet.has(c._id.toString()),
  }));

  return NextResponse.json({ challenges: result });
}
