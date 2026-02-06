export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Challenge } from "@/models/Challenge";
import { User } from "@/models/User";
import { PracticeSolve } from "@/models/PracticeSolve";

export async function GET() {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongo();

  const user = await User.findById(session.id).select("_id");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();

  // ✅ only expired challenges
  const challenges = await Challenge.find({ endsAt: { $lt: now } })
    .sort({ endsAt: -1 })
    .select("_id title category points endsAt");

  // ✅ get solved set for this user
  const solved = await PracticeSolve.find({ userId: user._id }).select("challengeId");
  const solvedSet = new Set(solved.map((s) => s.challengeId.toString()));

  return NextResponse.json({
    challenges: challenges.map((c: any) => ({
      _id: c._id.toString(),
      title: c.title,
      category: c.category,
      points: c.points,
      endsAt: c.endsAt,
      solved: solvedSet.has(c._id.toString()),
    })),
  });
}
