export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";

const CATEGORIES = new Set([
  "Web Exploitation",
  "Cryptography",
  "Forensics",
  "Pwn",
  "Reverse Engineering",
  "OSINT",
  "Misc",
  "Steganography",
]);

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();
  const list = await Challenge.find({})
    .sort({ createdAt: -1 })
    .select("_id title category points startsAt endsAt createdAt updatedAt files");

  return NextResponse.json({ challenges: list });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));

  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "");
  const points = Number(body.points ?? 0);
  const flag = String(body.flag ?? "").trim();

  // schedule fields (datetime-local strings)
  const startsAt = new Date(String(body.startsAt));
  const endsAt = new Date(String(body.endsAt));

  if (!title || title.length < 2 || title.length > 80) {
    return NextResponse.json({ error: "Title must be 2–80 characters." }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!Number.isFinite(points) || points <= 0 || points > 10000) {
    return NextResponse.json({ error: "Points must be 1–10000." }, { status: 400 });
  }
  if (!flag || flag.length < 4 || flag.length > 200) {
    return NextResponse.json({ error: "Flag must be 4–200 characters." }, { status: 400 });
  }

  // ✅ validate schedule
  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "Invalid start/end time." }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  await connectMongo();

  const flagHash = await bcrypt.hash(flag, 10);

  const created = await Challenge.create({
    title,
    category,
    description,
    points,
    flagHash,
    startsAt,
    endsAt,
    files: [],
  });

  return NextResponse.json({
    ok: true,
    challenge: {
      _id: created._id.toString(),
      title: created.title,
      category: created.category,
      points: created.points,
      startsAt: created.startsAt,
      endsAt: created.endsAt,
    },
  });
}
