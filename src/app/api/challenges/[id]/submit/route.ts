import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { requireUser } from "@/lib/requireUser";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";
import bcrypt from "bcryptjs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { session, denied } = await requireUser();
  if (denied) return denied;

  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const flag = String(body.flag ?? "").trim();

  if (!flag) {
    return NextResponse.json({ error: "Flag is required." }, { status: 400 });
  }

  await connectMongo();

  // IMPORTANT: flagHash is select:false in schema -> must select it explicitly
  const ch = await Challenge.findById(id).select("_id flagHash");
  if (!ch) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const ok = await bcrypt.compare(flag, (ch as any).flagHash);
  if (!ok) {
    return NextResponse.json({ correct: false, message: "Incorrect flag" }, { status: 200 });
  }

  // mark solve (unique index prevents duplicates)
  try {
    await Solve.create({ userId: session!.id, challengeId: id });
  } catch {
    // already solved -> ignore
  }

  return NextResponse.json({ correct: true, message: "Correct ✅" }, { status: 200 });
}
