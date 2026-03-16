import { createMockPortraitDataUri, generationRecords, loadingPhrases } from "@/lib/mock-data";
import { canUseGeminiImageGeneration, generateFantasyCatPortrait } from "@/lib/gemini";
import { getR2Config, uploadObjectToR2 } from "@/lib/r2";
import type { PortraitJobRecord, PortraitJobSnapshot } from "@/types/domain";

type NewMockJobInput = {
  catName: string;
  styleId: string;
  styleName: string;
  photoName: string;
  photoUrl: string;
  photoKey?: string;
  styleReferenceUrl: string;
};

type StoredPortraitJob = PortraitJobSnapshot & {
  photoName: string;
  photoUrl: string;
  photoKey?: string;
  styleReferenceUrl: string;
};

type GlobalJobStore = typeof globalThis & {
  __anikittyJobs?: Map<string, StoredPortraitJob>;
  __anikittyJobPromises?: Map<string, Promise<StoredPortraitJob | null>>;
};

const globalJobStore = globalThis as GlobalJobStore;

function getStore() {
  if (!globalJobStore.__anikittyJobs) {
    globalJobStore.__anikittyJobs = new Map<string, StoredPortraitJob>();
  }

  return globalJobStore.__anikittyJobs;
}

function getPromiseStore() {
  if (!globalJobStore.__anikittyJobPromises) {
    globalJobStore.__anikittyJobPromises = new Map<string, Promise<StoredPortraitJob | null>>();
  }

  return globalJobStore.__anikittyJobPromises;
}

export function createMockPortraitJob(input: NewMockJobInput): PortraitJobSnapshot {
  const id = `job_${Math.random().toString(36).slice(2, 10)}`;
  const job: StoredPortraitJob = {
    id,
    catName: input.catName,
    styleId: input.styleId,
    styleName: input.styleName,
    status: "queued",
    createdAt: new Date().toISOString(),
    progress: 10,
    loadingPhraseIndex: 1,
    photoName: input.photoName,
    photoUrl: input.photoUrl,
    photoKey: input.photoKey,
    styleReferenceUrl: input.styleReferenceUrl,
  };

  getStore().set(id, job);
  return toPublicSnapshot(job);
}

export async function getMockPortraitJobById(id: string) {
  const job = getStore().get(id);

  if (!job) {
    return null;
  }

  if (job.status === "done" || job.status === "failed") {
    return toPublicSnapshot(job);
  }

  const elapsedMs = Date.now() - new Date(job.createdAt).getTime();
  const seconds = elapsedMs / 1000;

  if (seconds < 2) {
    return updateJob(id, {
      status: "queued",
      progress: 16,
      loadingPhraseIndex: 1,
    });
  }

  if (seconds < 4) {
    return updateJob(id, {
      status: "processing",
      progress: 34,
      loadingPhraseIndex: 2,
    });
  }

  if (seconds < 6) {
    return updateJob(id, {
      status: "processing",
      progress: 56,
      loadingPhraseIndex: 3,
    });
  }

  if (seconds < 8) {
    return updateJob(id, {
      status: "processing",
      progress: 78,
      loadingPhraseIndex: 4,
    });
  }

  const completedJob = await ensureJobCompleted(id);
  return completedJob ? toPublicSnapshot(completedJob) : null;
}

export function getPortraitJobRecords(): PortraitJobRecord[] {
  const seededRecords = generationRecords.map((record) => ({ ...record }));
  const liveRecords = Array.from(getStore().values()).map((job) => toJobRecord(job));
  const merged = new Map<string, PortraitJobRecord>();

  for (const record of seededRecords) {
    merged.set(record.id, record);
  }

  for (const record of liveRecords) {
    merged.set(record.id, record);
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function ensureJobCompleted(id: string) {
  const existingPromise = getPromiseStore().get(id);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = processJob(id).finally(() => {
    getPromiseStore().delete(id);
  });
  getPromiseStore().set(id, promise);

  return promise;
}

async function processJob(id: string) {
  const job = getStore().get(id);

  if (!job) {
    return null;
  }

  try {
    updateStoredJob(id, {
      status: "processing",
      progress: 90,
      loadingPhraseIndex: 5,
    });

    if ((await canUseGeminiImageGeneration()) && getR2Config().isConfigured) {
      const generatedImage = await generateFantasyCatPortrait({
        catName: job.catName,
        styleName: job.styleName,
        catImageUrl: job.photoUrl,
        styleReferenceUrl: job.styleReferenceUrl,
      });
      const uploadedResult = await uploadObjectToR2({
        folder: "results",
        fileType: generatedImage.mimeType,
        body: Buffer.from(generatedImage.base64Data, "base64"),
        userId: job.photoKey ? job.photoKey.split("/")[1] ?? job.catName : job.catName,
      });

      return updateStoredJob(id, {
        status: "done",
        progress: 100,
        loadingPhraseIndex: loadingPhrases.length,
        resultImageUrl: uploadedResult.publicUrl,
        resultObjectKey: uploadedResult.objectKey,
        completedAt: new Date().toISOString(),
        errorMessage: undefined,
      });
    }

    return updateStoredJob(id, {
      status: "done",
      progress: 100,
      loadingPhraseIndex: loadingPhrases.length,
      resultImageUrl: createMockPortraitDataUri(job.catName, job.styleName),
      completedAt: new Date().toISOString(),
      errorMessage: undefined,
    });
  } catch (error) {
    return updateStoredJob(id, {
      status: "failed",
      progress: 100,
      loadingPhraseIndex: loadingPhrases.length,
      completedAt: new Date().toISOString(),
      errorMessage:
        error instanceof Error ? error.message : "Portrait generation failed unexpectedly.",
    });
  }
}

function updateJob(id: string, patch: Partial<StoredPortraitJob>) {
  const updated = updateStoredJob(id, patch);
  return updated ? toPublicSnapshot(updated) : null;
}

function updateStoredJob(id: string, patch: Partial<StoredPortraitJob>) {
  const current = getStore().get(id);

  if (!current) {
    return null;
  }

  const updated: StoredPortraitJob = {
    ...current,
    ...patch,
  };
  getStore().set(id, updated);

  return updated;
}

function toPublicSnapshot(job: StoredPortraitJob): PortraitJobSnapshot {
  return {
    id: job.id,
    catName: job.catName,
    styleId: job.styleId,
    styleName: job.styleName,
    status: job.status,
    createdAt: job.createdAt,
    progress: job.progress,
    loadingPhraseIndex: job.loadingPhraseIndex,
    resultImageUrl: job.resultImageUrl,
    resultObjectKey: job.resultObjectKey,
    errorMessage: job.errorMessage,
    completedAt: job.completedAt,
  };
}

function toJobRecord(job: StoredPortraitJob): PortraitJobRecord {
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
