import { NextResponse } from "next/server";
import { createMockPortraitJob } from "@/lib/mock-job-store";
import { getStyleById } from "@/lib/mock-data";

type PortraitJobRequestBody = {
  catName?: string;
  styleId?: string;
  photoUrl?: string;
  photoKey?: string;
  photoName?: string;
};

export async function POST(request: Request) {
  // TODO: Enforce real authentication / abuse controls before allowing job creation.
  // TODO: Persist jobs in a real database instead of an in-memory mock store.
  // TODO: Validate uploaded asset ownership, MIME type, and virus scanning asynchronously.
  // TODO: Map styleId to a secured style reference image stored in R2.
  // TODO: Call Gemini through a server-side integration layer only.
  // TODO: Store generated result images in `results/` on R2 and persist the final URL.
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
      return NextResponse.json(
        { error: "Missing required job inputs." },
        { status: 400 },
      );
    }

    const style = getStyleById(styleId);

    if (!style) {
      return NextResponse.json({ error: "Unknown style selected." }, { status: 400 });
    }

    const job = createMockPortraitJob({
      catName,
      styleId,
      styleName: style.name,
      photoName: photoName || photoKey || photoUrl,
    });

    return NextResponse.json(job, { status: 201 });
  }

  const formData = await request.formData();
  const catName = String(formData.get("catName") ?? "").trim();
  const styleId = String(formData.get("styleId") ?? "").trim();
  const photo = formData.get("photo");

  if (!catName || !styleId || !(photo instanceof File)) {
    return NextResponse.json(
      { error: "Missing required job inputs." },
      { status: 400 },
    );
  }

  const style = getStyleById(styleId);

  if (!style) {
    return NextResponse.json({ error: "Unknown style selected." }, { status: 400 });
  }

  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Mock validation rejected files larger than 10MB." },
      { status: 400 },
    );
  }

  const job = createMockPortraitJob({
    catName,
    styleId,
    styleName: style.name,
    photoName: photo.name,
  });

  return NextResponse.json(job, { status: 201 });
}
