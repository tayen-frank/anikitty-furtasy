"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import type { PortraitJobRecord } from "@/types/domain";
import { formatDateTime, getJobStatusTone } from "@/lib/utils";

const PAGE_SIZE = 10;

export function GenerationRecordsPanel({ records }: { records: PortraitJobRecord[] }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return records.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-admin-brass">Generation Records</p>
          <h2 className="mt-2 text-3xl text-admin-ink">History and output retention</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full bg-admin-cloud px-4 py-2 text-sm text-admin-slate">
            {records.length} record{records.length === 1 ? "" : "s"} retained
          </p>
          <Button
            variant="admin"
            type="button"
            onClick={() => {
              router.refresh();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-admin-cloud">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-admin-slate">
                <th className="px-5 py-4">Job ID</th>
                <th className="px-5 py-4">Preview</th>
                <th className="px-5 py-4">Cat Name</th>
                <th className="px-5 py-4">Selected Style</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created Time</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-admin-slate">
                    No generation records yet. Once portrait jobs are created, they will appear here.
                  </td>
                </tr>
              )}

              {paginatedRecords.map((record) => (
                <tr key={record.id} className="align-middle text-sm text-admin-ink">
                  <td className="px-5 py-4 font-semibold">{record.id}</td>
                  <td className="px-5 py-4">
                    <img
                      src={record.previewImageUrl}
                      alt={record.catName}
                      className="h-20 w-16 rounded-xl object-cover"
                    />
                  </td>
                  <td className="px-5 py-4">{record.catName}</td>
                  <td className="px-5 py-4">{record.styleName}</td>
                  <td className="px-5 py-4">
                    <Badge tone={getJobStatusTone(record.status)}>{record.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-admin-slate">{formatDateTime(record.createdAt)}</td>
                  <td className="px-5 py-4">
                    <a
                      href={record.previewImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({ variant: "admin" })}
                    >
                      View Output
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-admin-slate">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-3">
          <Button
            variant="admin"
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </Button>
          <Button
            variant="admin"
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <p className="text-sm leading-6 text-admin-slate">
        TODO: Replace the R2 JSON manifest with paginated database queries, filters, and role-based
        access controls for viewing retained portraits.
      </p>
    </div>
  );
}
