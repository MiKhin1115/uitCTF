export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Solve } from "@/models/Solve";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function GET() {
  await connectMongo();

  // ✅ Individual totals (all time)
  const individualsRaw = await Solve.aggregate([
    { $group: { _id: "$userId", points: { $sum: "$points" }, solves: { $sum: 1 } } },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 200 },
  ]);

  // ✅ Team totals (all time)
  const teamsRaw = await Solve.aggregate([
    { $group: { _id: "$teamId", points: { $sum: "$points" }, solves: { $sum: 1 } } },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 200 },
  ]);

  // Attach names (no fancy lookups, keep it reliable)
  const userIds = individualsRaw.map((r) => r._id);
  const teamIds = teamsRaw.map((r) => r._id);

  const users = await User.find({ _id: { $in: userIds } }).select("_id username");
  const teams = await Team.find({ _id: { $in: teamIds } }).select("_id name");

  const userMap = new Map(users.map((u: any) => [u._id.toString(), u.username]));
  const teamMap = new Map(teams.map((t: any) => [t._id.toString(), t.name]));

  const individuals = individualsRaw.map((r, i) => ({
    rank: i + 1,
    userId: r._id.toString(),
    username: userMap.get(r._id.toString()) || "Unknown",
    points: r.points || 0,
    solves: r.solves || 0,
  }));

  const teamRows = teamsRaw.map((r, i) => ({
    rank: i + 1,
    teamId: r._id.toString(),
    teamName: teamMap.get(r._id.toString()) || "Unknown",
    points: r.points || 0,
    solves: r.solves || 0,
  }));

  return NextResponse.json({ individuals, teams: teamRows });
}
