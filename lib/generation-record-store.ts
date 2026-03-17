import { createMockPortraitDataUri, generationRecords } from "@/lib/mock-data";
import { getR2Config, readJsonFromR2, writeJsonToR2 } from "@/lib/r2";
import type { PortraitJobRecord, PortraitJobSnapshot } from "@/types/domain";

export const GENERATION_RECORDS_OBJECT_KEY = "results/generation-records.json";

type PersistedGenerationRecords = {
  version: 1;
  updatedAt: string;
  records: PortraitJobRecord[];
};

export async function getGenerationRecords() {
  const persisted = await readPersistedGenerationRecords();

  if (!persisted?.records?.length) {
    return generationRecords.map((record) => ({ ...record }));
  }

  return persisted.records.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function upsertGenerationRecordFromSnapshot(job: PortraitJobSnapshot) {
  const current = await getGenerationRecords();
  const nextRecord = toGenerationRecord(job);
  const merged = new Map<string, PortraitJobRecord>();

  for (const record of current) {
    merged.set(record.id, record);
  }

  merged.set(nextRecord.id, nextRecord);

  const nextRecords = Array.from(merged.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  await writePersistedGenerationRecords(nextRecords);
  return nextRecord;
}

async function readPersistedGenerationRecords() {
  if (!getR2Config().isConfigured) {
    return null;
  }

  return readJsonFromR2<PersistedGenerationRecords>(GENERATION_RECORDS_OBJECT_KEY);
}

async function writePersistedGenerationRecords(records: PortraitJobRecord[]) {
  await writeJsonToR2<PersistedGenerationRecords>({
    objectKey: GENERATION_RECORDS_OBJECT_KEY,
    value: {
      version: 1,
      updatedAt: new Date().toISOString(),
      records,
    },
    cacheControl: "no-store",
  });
}

function toGenerationRecord(job: PortraitJobSnapshot): PortraitJobRecord {
  return {
    id: job.id,
    catName: job.catName,
    styleId: job.styleId,
    styleName: job.styleName,
    status: job.status,
    createdAt: job.createdAt,
    previewImageUrl: job.resultImageUrl ?? createMockPortraitDataUri(job.catName, job.styleName),
  };
}
