import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { requireAdmin } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();
  const challenges = await Challenge.find()
    .select("_id title category points createdAt files") // ✅ never return flagHash
    .sort({ createdAt: -1 });

  return NextResponse.json({ challenges });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const points = Number(body.points ?? 0);
  const category = String(body.category ?? "");
  const flag = String(body.flag ?? "").trim();

  if (!title || title.length < 3) {
    return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
  }
  if (!description || description.length < 5) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }
  if (!Number.isFinite(points) || points < 0) {
    return NextResponse.json({ error: "Points must be a valid number." }, { status: 400 });
  }
  if (!flag || flag.length < 4) {
    return NextResponse.json({ error: "Flag is required." }, { status: 400 });
  }

  const flagHash = await bcrypt.hash(flag, 10);

  await connectMongo();
  const ch = await Challenge.create({
    title,
    description,
    points,
    category,
    flagHash,
    files: [],
  });

  // return only safe fields
  return NextResponse.json(
    {
      challenge: {
        _id: ch._id,
        title: ch.title,
        description: ch.description,
        points: ch.points,
        category: ch.category,
        files: ch.files,
        createdAt: ch.createdAt,
      },
    },
    { status: 201 }
  );
}
