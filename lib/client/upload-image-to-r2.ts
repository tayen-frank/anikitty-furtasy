import type { R2Folder } from "@/lib/r2";

type UploadImageToR2Input = {
  file: File;
  folder: R2Folder;
  userId?: string;
};

type UploadImageToR2Result = {
  publicUrl: string;
  objectKey: string;
};

type UploadUrlResponse = {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  method: "PUT";
  headers: Record<string, string>;
};

export async function uploadImageToR2({
  file,
  folder,
  userId,
}: UploadImageToR2Input): Promise<UploadImageToR2Result> {
  const uploadUrlResponse = await fetch("/api/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileType: file.type,
      folder,
      userId,
    }),
  });
  const uploadUrlPayload = (await uploadUrlResponse.json().catch(() => null)) as
    | (UploadUrlResponse & { error?: never })
    | { error?: string }
    | null;

  if (!uploadUrlResponse.ok || !uploadUrlPayload || !("uploadUrl" in uploadUrlPayload)) {
    throw new Error(uploadUrlPayload?.error ?? "Unable to request an R2 upload URL.");
  }

  const uploadResponse = await fetch(uploadUrlPayload.uploadUrl, {
    method: uploadUrlPayload.method,
    headers: uploadUrlPayload.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Direct upload to R2 failed.");
  }

  return {
    publicUrl: uploadUrlPayload.publicUrl,
    objectKey: uploadUrlPayload.objectKey,
  };
}
