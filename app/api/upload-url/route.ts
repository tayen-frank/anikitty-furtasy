import { NextResponse } from "next/server";
import { createPresignedUploadUrl, isValidR2Folder } from "@/lib/r2";

type UploadUrlRequestBody = {
  fileType?: string;
  folder?: string;
  userId?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  // TODO: Enforce real auth/role checks so only admins can write to `styles/`.
  // TODO: Add file size validation and per-user quotas before issuing upload URLs.
  // TODO: Restrict folders by caller role once customer/admin auth is fully integrated.
  const body = (await request.json().catch(() => null)) as UploadUrlRequestBody | null;
  const fileType = String(body?.fileType ?? "").trim();
  const folder = String(body?.folder ?? "").trim();
  const userId = String(body?.userId ?? "anonymous").trim();

  if (!fileType || !folder) {
    return NextResponse.json(
      { error: "Both `fileType` and `folder` are required." },
      { status: 400 },
    );
  }

  if (!isValidR2Folder(folder)) {
    return NextResponse.json(
      { error: "Invalid folder. Allowed folders: styles, uploads, results." },
      { status: 400 },
    );
  }

  try {
    const payload = await createPresignedUploadUrl({
      folder,
      fileType,
      userId,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate upload URL.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
