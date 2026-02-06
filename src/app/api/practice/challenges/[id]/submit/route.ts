export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Challenge } from "@/models/Challenge";
import { User } from "@/models/User";
import { PracticeSolve } from "@/models/PracticeSolve";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const flag = String(body?.flag ?? "").trim();
  if (!flag) return NextResponse.json({ error: "Flag is required" }, { status: 400 });

  await connectMongo();

  const user = await User.findById(session.id).select("_id");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ch = await Challenge.findById(id).select("_id flagHash endsAt");
  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // ✅ practice only after it ends
  const now = new Date();
  if (now <= ch.endsAt) {
    return NextResponse.json({ error: "This challenge is still in the event." }, { status: 403 });
  }

  // ✅ already solved in practice?
  const already = await PracticeSolve.findOne({ userId: user._id, challengeId: ch._id }).select("_id");
  if (already) return NextResponse.json({ correct: true, alreadySolved: true });

  const ok = await bcrypt.compare(flag, ch.flagHash);
  if (!ok) return NextResponse.json({ correct: false });

  try {
    await PracticeSolve.create({ userId: user._id, challengeId: ch._id });
  } catch {
    return NextResponse.json({ correct: true, alreadySolved: true });
  }

  return NextResponse.json({ correct: true, alreadySolved: false });
}
