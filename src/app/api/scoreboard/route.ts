export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Solve } from "@/models/Solve";

export async function GET() {
  await connectMongo();

  const now = new Date();

  const current = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id");

  if (!current) return NextResponse.json({ event: null, individuals: [], teams: [] });

  const individuals = await Solve.aggregate([
    { $match: { eventId: current._id } },
    { $group: { _id: "$userId", points: { $sum: "$points" }, solves: { $sum: 1 } } },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 200 },
  ]);

  const teams = await Solve.aggregate([
    { $match: { eventId: current._id } },
    { $group: { _id: "$teamId", points: { $sum: "$points" }, solves: { $sum: 1 } } },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 200 },
  ]);

  return NextResponse.json({ event: current._id.toString(), individuals, teams });
}
