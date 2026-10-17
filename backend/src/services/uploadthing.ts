
import { UTApi } from "uploadthing/server";

const token = process.env.UPLOADTHING_TOKEN;

if (!token) {
  throw new Error("UPLOADTHING_TOKEN is missing in environment variables.");
}

export const utapi = new UTApi({ token });
