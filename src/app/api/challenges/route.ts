export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Team } from "@/models/Team";
import { Challenge } from "@/models/Challenge";

export async function GET() {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongo();

  // ✅ Must be participant (in a team)
  const team = await Team.findOne({ "members.userId": session.id }).select("_id");
  if (!team) return NextResponse.json({ error: "Join a team first" }, { status: 403 });

  const now = new Date();

  const challenges = await Challenge.find({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .sort({ points: 1, createdAt: -1 })
    .select("_id title category points startsAt endsAt");

  return NextResponse.json({ challenges });
}
