export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";

import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // ✅ auth
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ body
  const body = await req.json().catch(() => ({}));
  const flag = String(body?.flag ?? "").trim();
  if (!flag) return NextResponse.json({ error: "Flag is required" }, { status: 400 });

  await connectMongo();

  // ✅ ensure user exists
  const user = await User.findById(session.id).select("_id email");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // ✅ must be in a team (participating team)
  // Assumption: Team has `members: ObjectId[]`
  const team = await Team.findOne({ members: user._id }).select("_id name");
  if (!team) {
    return NextResponse.json({ error: "You must create or join a team first." }, { status: 403 });
  }

  // ✅ load challenge (needs eventId + schedule window)
  const ch = await Challenge.findById(id).select(
    "_id title points flagHash startsAt endsAt eventId"
  );

  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // ✅ must be active in event window
  const now = new Date();
  if (now < ch.startsAt || now > ch.endsAt) {
    return NextResponse.json({ error: "Challenge not active." }, { status: 403 });
  }

  // ✅ already solved? (fast path)
  const already = await Solve.findOne({
    teamId: team._id,
    challengeId: ch._id,
    eventId: ch.eventId,
  }).select("_id");

  if (already) {
    return NextResponse.json({ correct: true, alreadySolved: true, points: 0 });
  }

  // ✅ check flag
  const ok = await bcrypt.compare(flag, ch.flagHash);
  if (!ok) {
    return NextResponse.json({ correct: false, error: "Incorrect flag" }, { status: 200 });
  }

  // ✅ create solve (event points)
  try {
    await Solve.create({
      userId: user._id,
      teamId: team._id,
      challengeId: ch._id,
      points: ch.points,
      eventId: ch.eventId, // ✅ IMPORTANT
    });
  } catch (e: any) {
    // duplicate key = solved in parallel
    if (e?.code === 11000) {
      return NextResponse.json({ correct: true, alreadySolved: true, points: 0 });
    }
    return NextResponse.json({ error: "Failed to record solve." }, { status: 500 });
  }

  return NextResponse.json({ correct: true, alreadySolved: false, points: ch.points });
}
