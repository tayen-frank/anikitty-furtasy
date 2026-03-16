import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { PortraitJobRecord } from "@/types/domain";
import { formatDateTime, getJobStatusTone } from "@/lib/utils";

export function GenerationRecordsPanel({ records }: { records: PortraitJobRecord[] }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.26em] text-admin-brass">Generation Records</p>
        <h2 className="mt-2 text-3xl text-admin-ink">History and output retention</h2>
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
              {records.map((record) => (
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

      <p className="text-sm leading-6 text-admin-slate">
        TODO: Replace mock records with paginated database results, signed output URLs, and access
        control checks for viewing retained portraits.
      </p>
    </div>
  );
}
