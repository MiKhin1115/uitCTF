export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Team } from "@/models/Team";

function cleanName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

export async function GET() {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongo();

  const team = await Team.findOne({ "members.userId": session.id }).select(
    "_id name ownerId members inviteToken createdAt"
  );

  if (!team) {
    return NextResponse.json({ team: null });
  }

  return NextResponse.json({
    team: {
      id: team._id.toString(),
      name: team.name,
      ownerId: team.ownerId,
      isLeader: team.ownerId === session.id,
      inviteToken: team.inviteToken,
      members: team.members || [],
      createdAt: team.createdAt,
    },
  });
}

export async function PATCH(req: Request) {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = cleanName(String(body?.name ?? ""));

  if (name.length < 3 || name.length > 32) {
    return NextResponse.json(
      { error: "Team name must be 3–32 characters." },
      { status: 400 }
    );
  }

  await connectMongo();

  const team = await Team.findOne({ "members.userId": session.id });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (team.ownerId !== session.id) {
    return NextResponse.json({ error: "Only team leader can rename the team." }, { status: 403 });
  }

  // prevent duplicates
  const exists = await Team.findOne({ _id: { $ne: team._id }, name }).select("_id");
  if (exists) {
    return NextResponse.json({ error: "Team name already exists." }, { status: 409 });
  }

  team.name = name;
  await team.save();

  return NextResponse.json({
    ok: true,
    team: {
      id: team._id.toString(),
      name: team.name,
    },
  });
}
