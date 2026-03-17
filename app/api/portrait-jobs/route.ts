import { NextResponse } from "next/server";
import { createMockPortraitJob } from "@/lib/mock-job-store";
import { getStyleById } from "@/lib/style-store";

type PortraitJobRequestBody = {
  catName?: string;
  styleId?: string;
  photoUrl?: string;
  photoKey?: string;
  photoName?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  // TODO: Enforce real authentication / abuse controls before allowing job creation.
  // TODO: Persist jobs in a real database instead of an in-memory store.
  // TODO: Validate uploaded asset ownership, MIME type, and malware scanning asynchronously.
  // TODO: Replace this R2-backed style manifest with persisted style-library records from the database.
  // TODO: Move long-running generation into a durable queue / worker for production scale.
  // TODO: Add audit logging and rate limiting for production usage.
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as PortraitJobRequestBody | null;
    const catName = String(body?.catName ?? "").trim();
    const styleId = String(body?.styleId ?? "").trim();
    const photoUrl = String(body?.photoUrl ?? "").trim();
    const photoKey = String(body?.photoKey ?? "").trim();
    const photoName = String(body?.photoName ?? "").trim();

    if (!catName || !styleId || !photoUrl) {
      return NextResponse.json({ error: "Missing required job inputs." }, { status: 400 });
    }

    const style = await getStyleById(styleId);

    if (!style) {
      return NextResponse.json({ error: "Unknown style selected." }, { status: 400 });
    }

    const styleReferenceUrl = style.imageUrl.startsWith("http")
      ? style.imageUrl
      : new URL(style.imageUrl, request.url).toString();
    const job = await createMockPortraitJob({
      catName,
      styleId,
      styleName: style.name,
      photoName: photoName || photoKey || photoUrl,
      photoUrl,
      photoKey: photoKey || undefined,
      styleReferenceUrl,
    });

    return NextResponse.json(job, { status: 201 });
  }

  return NextResponse.json(
    {
      error:
        "Legacy multipart uploads are no longer supported here. Upload the image to R2 first, then submit the returned photoUrl/photoKey.",
    },
    { status: 400 },
  );
}
