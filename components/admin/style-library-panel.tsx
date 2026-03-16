"use client";

import { useMemo, useState } from "react";
import { uploadImageToR2 } from "@/lib/client/upload-image-to-r2";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { FantasyStyle } from "@/types/domain";
import { formatDateTime } from "@/lib/utils";

export function StyleLibraryPanel({ initialStyles }: { initialStyles: FantasyStyle[] }) {
  const [styles, setStyles] = useState(initialStyles);
  const [message, setMessage] = useState(
    "Style assets now upload directly to Cloudflare R2 using presigned URLs.",
  );
  const [uploadingStyleId, setUploadingStyleId] = useState<string | null>(null);

  const sortedStyles = useMemo(
    () => [...styles].sort((left, right) => left.name.localeCompare(right.name)),
    [styles],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-admin-brass">Style Library</p>
          <h2 className="mt-2 text-3xl text-admin-ink">Manage fantasy reference assets</h2>
        </div>
        <p className="rounded-full bg-admin-cloud px-4 py-2 text-sm text-admin-slate">{message}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {sortedStyles.map((style) => (
          <div
            key={style.id}
            className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-panel"
          >
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <img
                src={style.imageUrl}
                alt={style.name}
                className="aspect-[4/5] w-full rounded-[1.25rem] object-cover"
              />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl text-admin-ink">{style.name}</h3>
                  <Badge tone="admin">{style.status}</Badge>
                </div>
                <p className="text-sm leading-6 text-admin-slate">{style.description}</p>
                <dl className="grid gap-2 text-sm text-admin-slate">
                  <div className="flex gap-2">
                    <dt className="min-w-24 font-semibold text-admin-ink">id</dt>
                    <dd>{style.id}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="min-w-24 font-semibold text-admin-ink">slug</dt>
                    <dd>{style.slug}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="min-w-24 font-semibold text-admin-ink">imageUrl</dt>
                    <dd className="break-all">{style.imageUrl}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="min-w-24 font-semibold text-admin-ink">updatedAt</dt>
                    <dd>{formatDateTime(style.updatedAt)}</dd>
                  </div>
                </dl>
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      setUploadingStyleId(style.id);
                      setMessage(`Uploading ${style.name} to R2...`);

                      try {
                        const uploadedStyleImage = await uploadImageToR2({
                          file,
                          folder: "styles",
                          userId: "admin-library",
                        });

                        setStyles((current) =>
                          current.map((item) =>
                            item.id === style.id
                              ? {
                                  ...item,
                                  imageUrl: uploadedStyleImage.publicUrl,
                                  updatedAt: new Date().toISOString(),
                                }
                              : item,
                          ),
                        );
                        setMessage(`Uploaded ${style.name} to R2 successfully.`);
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : `Failed to upload ${style.name} to R2.`,
                        );
                      } finally {
                        setUploadingStyleId(null);
                        event.target.value = "";
                      }
                    }}
                  />
                  <span className={buttonStyles({ variant: "admin" })}>
                    {uploadingStyleId === style.id
                      ? "Uploading..."
                      : style.imageUrl.includes("/styles/")
                        ? "Replace in R2"
                        : "Upload / Replace"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm leading-6 text-admin-slate">
        TODO: Persist style metadata in the database and keep a revision history for asset changes.
      </p>
    </div>
  );
}
