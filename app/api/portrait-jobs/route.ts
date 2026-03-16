import { NextResponse } from "next/server";
import { createMockPortraitJob } from "@/lib/mock-job-store";
import { getStyleById } from "@/lib/mock-data";

export async function POST(request: Request) {
  // TODO: Enforce real authentication / abuse controls before allowing job creation.
  // TODO: Persist jobs in a real database instead of an in-memory mock store.
  // TODO: Validate MIME type, dimensions, and malware scanning for uploaded files.
  // TODO: Upload original inputs to object storage before dispatching AI generation.
  // TODO: Call Gemini through a server-side integration layer only.
  // TODO: Add audit logging and rate limiting for production usage.
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
