export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

function makeToken() {
  return crypto.randomBytes(18).toString("hex"); // 36 chars
}

export async function POST(req: Request) {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const password = String(body?.password ?? "").trim();

  if (name.length < 3) {
    return NextResponse.json({ error: "Team name must be at least 3 chars." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Team password must be at least 6 chars." }, { status: 400 });
  }

  await connectMongo();

  // user exists?
  const u = await User.findById(session.id).select("_id username");
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // user already in a team?
  const existingTeam = await Team.findOne({ "members.userId": session.id }).select("_id");
  if (existingTeam) return NextResponse.json({ error: "You are already in a team." }, { status: 409 });

  // unique invite token
  let inviteToken = makeToken();
  for (let i = 0; i < 5; i++) {
    const used = await Team.findOne({ inviteToken }).select("_id");
    if (!used) break;
    inviteToken = makeToken();
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const created = await Team.create({
    name,
    ownerId: session.id,
    passwordHash,
    inviteToken,
    members: [{ userId: session.id, username: u.username }],
  });

  return NextResponse.json({
    ok: true,
    teamId: created._id.toString(),
    inviteToken,
  });
}
