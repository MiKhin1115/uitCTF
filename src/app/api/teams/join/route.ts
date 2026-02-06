export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const inviteToken = String(body?.inviteToken ?? "").trim();
  if (inviteToken.length < 10) {
    return NextResponse.json({ error: "Invalid invitation token." }, { status: 400 });
  }

  await connectMongo();

  const u = await User.findById(session.id).select("_id username");
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // already in a team?
  const already = await Team.findOne({ "members.userId": session.id }).select("_id");
  if (already) return NextResponse.json({ error: "You are already in a team." }, { status: 409 });

  const team = await Team.findOne({ inviteToken });
  if (!team) return NextResponse.json({ error: "Team not found for this token." }, { status: 404 });

  // add member if not present
  const exists = team.members.some((m: any) => m.userId === session.id);
  if (!exists) {
    team.members.push({ userId: session.id, username: u.username });
    await team.save();
  }

  return NextResponse.json({ ok: true, teamId: team._id.toString(), teamName: team.name });
}
