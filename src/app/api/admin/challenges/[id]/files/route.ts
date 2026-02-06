export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { getGridFSBucket } from "@/lib/gridfs";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;

  await connectMongo();
  const ch = await Challenge.findById(id);
  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const form = await req.formData();

  // ✅ accept:
  // - multiple: <input name="files" multiple />
  // - or single: <input name="file" />
  const filesFromMany = form.getAll("files").filter(Boolean) as File[];
  const single = form.get("file") as File | null;

  const files: File[] =
    filesFromMany.length > 0 ? filesFromMany : single ? [single] : [];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
  }

  const bucket = getGridFSBucket();
  const saved: { fileId: string; filename: string }[] = [];

  for (const file of files) {
    // limit: 10 MB each
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large (max 10MB): ${file.name}` },
        { status: 400 }
      );
    }

    const contentType = file.type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        challengeId: id,
        contentType,
        originalName: file.name,
      },
    });

    await new Promise<void>((resolve, reject) => {
      uploadStream.on("finish", () => resolve());
      uploadStream.on("error", (e) => reject(e));
      uploadStream.end(buffer);
    });

    const fileId = (uploadStream.id as ObjectId).toString();

    ch.files.push({
      fileId,
      filename: file.name,
      contentType,
      size: file.size,
    });

    saved.push({ fileId, filename: file.name });
  }

  await ch.save();
  return NextResponse.json({ ok: true, saved });
}
