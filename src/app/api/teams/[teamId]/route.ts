export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Team } from "@/models/Team";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await ctx.params;

  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongo();

  // Only allow participants (has team) to view details (you can make stricter if you want)
  const viewerTeam = await Team.findOne({ "members.userId": session.id }).select("_id");
  if (!viewerTeam) return NextResponse.json({ error: "Join a team first" }, { status: 403 });

  const team = await Team.findById(teamId).select("_id name ownerId members");
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  return NextResponse.json({
    team: {
      id: team._id.toString(),
      name: team.name,
      ownerId: team.ownerId,
      members: (team.members || []).map((m: any) => ({
        userId: String(m.userId),
        username: String(m.username),
      })),
    },
  });
}
