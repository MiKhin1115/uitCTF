import mongoose from "mongoose";
import { GridFSBucket, type Db } from "mongodb";

let bucket: GridFSBucket | null = null;

export function getGridFSBucket() {
  const db = (mongoose.connection.db as Db | undefined);
  if (!db) throw new Error("MongoDB not connected");

  if (!bucket) {
    bucket = new GridFSBucket(db, { bucketName: "challengeFiles" });
  }
  return bucket;
}
