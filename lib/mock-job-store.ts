import { createMockPortraitDataUri, loadingPhrases } from "@/lib/mock-data";
import type { PortraitJobSnapshot } from "@/types/domain";

type NewMockJobInput = {
  catName: string;
  styleId: string;
  styleName: string;
  photoName: string;
};

type GlobalJobStore = typeof globalThis & {
  __anikittyJobs?: Map<string, PortraitJobSnapshot>;
};

const globalJobStore = globalThis as GlobalJobStore;

function getStore() {
  if (!globalJobStore.__anikittyJobs) {
    globalJobStore.__anikittyJobs = new Map<string, PortraitJobSnapshot>();
  }

  return globalJobStore.__anikittyJobs;
}

export function createMockPortraitJob(input: NewMockJobInput): PortraitJobSnapshot {
  const id = `job_${Math.random().toString(36).slice(2, 10)}`;
  const job: PortraitJobSnapshot = {
    id,
    catName: input.catName,
    styleId: input.styleId,
    styleName: input.styleName,
    status: "queued",
    createdAt: new Date().toISOString(),
    progress: 10,
    loadingPhraseIndex: 1,
  };

  getStore().set(id, job);
  return job;
}

export function getMockPortraitJobById(id: string) {
  const job = getStore().get(id);

  if (!job) {
    return null;
  }

  const elapsedMs = Date.now() - new Date(job.createdAt).getTime();
  const seconds = elapsedMs / 1000;

  let nextSnapshot: PortraitJobSnapshot = {
    ...job,
    status: "queued",
    progress: 16,
    loadingPhraseIndex: 1,
  };

  if (seconds >= 2 && seconds < 4) {
    nextSnapshot = {
      ...job,
      status: "processing",
      progress: 34,
      loadingPhraseIndex: 2,
    };
  }

  if (seconds >= 4 && seconds < 6) {
    nextSnapshot = {
      ...job,
      status: "processing",
      progress: 56,
      loadingPhraseIndex: 3,
    };
  }

  if (seconds >= 6 && seconds < 8) {
    nextSnapshot = {
      ...job,
      status: "processing",
      progress: 78,
      loadingPhraseIndex: 4,
    };
  }

  if (seconds >= 8) {
    nextSnapshot = {
      ...job,
      status: "done",
      progress: 100,
      loadingPhraseIndex: loadingPhrases.length,
      resultImageUrl: createMockPortraitDataUri(job.catName, job.styleName),
      completedAt: new Date(new Date(job.createdAt).getTime() + 8000).toISOString(),
    };
  }

  getStore().set(id, nextSnapshot);
  return nextSnapshot;
}
