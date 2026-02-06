import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const points = Number(body.points ?? 0);
  const category = String(body.category ?? "");

  if (!title || !description || !Number.isFinite(points)) {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  await connectMongo();
  const updated = await Challenge.findByIdAndUpdate(
    id,
    { title, description, points, category },
    { new: true }
  ).select("_id title description points category files createdAt");

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ challenge: updated });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;

  await connectMongo();
  const deleted = await Challenge.findByIdAndDelete(id).select("_id");
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
