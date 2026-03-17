import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, readAdminSession } from "@/lib/auth/admin-session";
import { updateStyleAsset } from "@/lib/style-store";

type UpdateStyleBody = {
  imageUrl?: string;
  objectKey?: string;
  status?: "active" | "draft";
  description?: string;
  name?: string;
};

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null,
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdateStyleBody | null;
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : undefined;
  const objectKey = typeof body?.objectKey === "string" ? body.objectKey.trim() : undefined;
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const status =
    body?.status === "draft" ? "draft" : body?.status === "active" ? "active" : undefined;

  const hasImageUrl = Boolean(imageUrl);
  const hasObjectKey = Boolean(objectKey);

  if (hasImageUrl !== hasObjectKey) {
    return NextResponse.json(
      { error: "imageUrl and objectKey must be provided together when replacing an image." },
      { status: 400 },
    );
  }

  if (!hasImageUrl && !name && !description && !status) {
    return NextResponse.json(
      { error: "Provide at least one field to update." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateStyleAsset(id, {
      imageUrl,
      objectKey,
      status,
      description,
      name,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ error: "Style not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update style asset.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
