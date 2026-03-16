export type FlowStepId = "start" | "style" | "upload" | "processing" | "reveal";

export type StyleAssetStatus = "active" | "draft";
export type PortraitJobStatus = "queued" | "processing" | "done" | "failed";
export type AdminDashboardTab = "style-library" | "gemini-settings" | "generation-records";

export type FantasyStyle = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
  status: StyleAssetStatus;
};

export type PortraitJobSnapshot = {
  id: string;
  catName: string;
  styleId: string;
  styleName: string;
  status: PortraitJobStatus;
  createdAt: string;
  progress: number;
  loadingPhraseIndex: number;
  resultImageUrl?: string;
  resultObjectKey?: string;
  errorMessage?: string;
  completedAt?: string;
};

export type PortraitJobRecord = {
  id: string;
  previewImageUrl: string;
  catName: string;
  styleId: string;
  styleName: string;
  status: PortraitJobStatus;
  createdAt: string;
};

export type AppSettings = {
  gemini: {
    modelName: string;
    availableModels: string[];
    promptTemplate: string;
    apiKeyConfigured: boolean;
    lastRotatedAt: string | null;
  };
};

export type AdminDashboardTabConfig = {
  id: AdminDashboardTab;
  label: string;
  description: string;
};
