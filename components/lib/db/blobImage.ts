import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_TOKEN!;

export async function uploadPrizeImage(filename: string) {
  const localPath = path.join("/prize", filename);

  if (!fs.existsSync(localPath)) throw new Error("File not found");

  const buffer = fs.readFileSync(localPath);

  const blob = await put(`prizes/${filename}`, buffer, {
    access: "public",
    token: BLOB_TOKEN,
  });

  return blob.url;
}
