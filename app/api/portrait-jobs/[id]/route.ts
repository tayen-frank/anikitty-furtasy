import { NextResponse } from "next/server";
import { getMockPortraitJobById } from "@/lib/mock-job-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: Require authenticated context for job ownership checks in production.
  // TODO: Read job state from a durable store or queue worker instead of process memory.
  // TODO: Add signed asset URLs for output images when object storage is enabled.
  const { id } = await params;
  const job = getMockPortraitJobById(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json(job, { status: 200 });
}
