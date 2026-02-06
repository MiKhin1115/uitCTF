import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function GET() {
  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;

  if (!token) return NextResponse.json({ user: null });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ user: null });

  await connectMongo();

  const dbUser = await User.findById(session.id).select("_id username email avatar");
  if (!dbUser) return NextResponse.json({ user: null });

  // find user's team (member)
  const team = await Team.findOne({ "members.userId": session.id }).select("_id name");

  return NextResponse.json({
    user: {
      id: dbUser._id.toString(),
      username: dbUser.username,
      email: dbUser.email,
      avatar: dbUser.avatar || "",
      teamId: team?._id?.toString() || "",
      teamName: team?.name || "",
    },
  });
}
