import { db } from "./indexedDb";
import type { Bucket } from "../domain/master";

export async function listBuckets(): Promise<Bucket[]> {
  return db.buckets.orderBy("name").toArray();
}

export async function upsertBucket(bucket: Bucket): Promise<void> {
  await db.buckets.put(bucket);
}

export async function deleteBucket(id: string): Promise<void> {
  await db.buckets.delete(id);
}
