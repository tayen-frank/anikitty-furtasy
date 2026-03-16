"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { FlowStepper } from "@/components/public/flow-stepper";
import { ProcessingStep } from "@/components/public/processing-step";
import { RevealStep } from "@/components/public/reveal-step";
import { StartStep } from "@/components/public/start-step";
import { StyleSelectionStep } from "@/components/public/style-selection-step";
import { UploadStep } from "@/components/public/upload-step";
import { uploadImageToR2 } from "@/lib/client/upload-image-to-r2";
import { loadingPhrases, publicFlowSteps, styles } from "@/lib/mock-data";
import type { FlowStepId, PortraitJobSnapshot } from "@/types/domain";

const STORAGE_KEY = "anikitty-public-flow";

type PersistedFlowState = {
  currentStep: FlowStepId;
  catName: string;
  passCode: string;
  styleId: string;
  photoName: string;
  jobId: string | null;
  resultImageUrl: string | null;
};

export function PublicFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStepId>("start");
  const [catName, setCatName] = useState("");
  const [passCode, setPassCode] = useState("");
  const [styleId, setStyleId] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [jobSnapshot, setJobSnapshot] = useState<PortraitJobSnapshot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const revealTimeoutRef = useRef<number | null>(null);
  const selectedStyle = useMemo(() => styles.find((style) => style.id === styleId), [styleId]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PersistedFlowState;
        setCurrentStep(parsed.currentStep ?? "start");
        setCatName(parsed.catName ?? "");
        setPassCode(parsed.passCode ?? "");
        setStyleId(parsed.styleId ?? "");
        setPhotoName(parsed.photoName ?? "");
        setJobSnapshot(
          parsed.jobId
            ? {
                id: parsed.jobId,
                catName: parsed.catName ?? "",
                styleId: parsed.styleId ?? "",
                styleName: styles.find((style) => style.id === parsed.styleId)?.name ?? "",
                status: parsed.resultImageUrl ? "done" : "queued",
                createdAt: new Date().toISOString(),
                progress: parsed.resultImageUrl ? 100 : 5,
                loadingPhraseIndex: parsed.resultImageUrl ? loadingPhrases.length : 1,
                resultImageUrl: parsed.resultImageUrl ?? undefined,
              }
            : null,
        );
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const payload: PersistedFlowState = {
      currentStep,
      catName,
      passCode,
      styleId,
      photoName,
      jobId: jobSnapshot?.id ?? null,
      resultImageUrl: jobSnapshot?.resultImageUrl ?? null,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [catName, currentStep, hasHydrated, jobSnapshot, passCode, photoName, styleId]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }

      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (currentStep !== "processing" || !jobSnapshot?.id) {
      return;
    }

    let isCancelled = false;

    const pollJob = async () => {
      const response = await fetch(`/api/portrait-jobs/${jobSnapshot.id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as PortraitJobSnapshot;

      if (isCancelled) {
        return;
      }

      setJobSnapshot(data);

      if (data.status === "done" && data.resultImageUrl) {
        if (revealTimeoutRef.current) {
          window.clearTimeout(revealTimeoutRef.current);
        }

        revealTimeoutRef.current = window.setTimeout(() => {
          startTransition(() => setCurrentStep("reveal"));
        }, 900);
      }
    };

    void pollJob();
    const interval = window.setInterval(() => {
      void pollJob();
    }, 1400);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
    };
  }, [currentStep, jobSnapshot?.id]);

  const resetFlow = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setCurrentStep("start");
    setCatName("");
    setPassCode("");
    setStyleId("");
    setPhotoFile(null);
    setPhotoName("");
    setPhotoPreviewUrl(null);
    setJobSnapshot(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoFile(file);
    setPhotoName(file.name);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreateJob = async () => {
    if (!photoFile || !selectedStyle || !catName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedPhoto = await uploadImageToR2({
        file: photoFile,
        folder: "uploads",
        userId: createUploadUserId(catName),
      });
      const response = await fetch("/api/portrait-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          catName,
          styleId: selectedStyle.id,
          photoName: photoFile.name,
          photoUrl: uploadedPhoto.publicUrl,
          photoKey: uploadedPhoto.objectKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create portrait job");
      }

      const data = (await response.json()) as PortraitJobSnapshot;
      setJobSnapshot(data);
      setCurrentStep("processing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="fantasy-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-aurora backdrop-blur sm:p-7">
          <FlowStepper steps={[...publicFlowSteps]} activeStep={currentStep} />
        </div>

        <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-black/10 p-5 backdrop-blur sm:p-8">
          {currentStep === "start" && (
            <StartStep
              catName={catName}
              passCode={passCode}
              onCatNameChange={setCatName}
              onPassCodeChange={setPassCode}
              onNext={() => setCurrentStep("style")}
            />
          )}

          {currentStep === "style" && (
            <StyleSelectionStep
              styles={styles}
              selectedStyleId={styleId}
              onSelect={setStyleId}
              onPrevious={() => setCurrentStep("start")}
              onNext={() => setCurrentStep("upload")}
            />
          )}

          {currentStep === "upload" && (
            <UploadStep
              selectedStyle={selectedStyle}
              photoName={photoName}
              photoPreviewUrl={photoPreviewUrl}
              onFileChange={handleFileChange}
              onChangeStyle={() => setCurrentStep("style")}
              onPrevious={() => setCurrentStep("style")}
              onNext={() => {
                void handleCreateJob();
              }}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === "processing" && jobSnapshot && (
            <ProcessingStep
              catName={catName}
              styleName={selectedStyle?.name ?? jobSnapshot.styleName}
              progress={jobSnapshot.progress}
              loadingPhraseIndex={jobSnapshot.loadingPhraseIndex}
              phrases={loadingPhrases}
              status={jobSnapshot.status}
              onPrevious={() => setCurrentStep("upload")}
              onNext={() => setCurrentStep("reveal")}
            />
          )}

          {currentStep === "reveal" && jobSnapshot?.resultImageUrl && (
            <RevealStep
              catName={catName}
              style={selectedStyle}
              resultImageUrl={jobSnapshot.resultImageUrl}
              onPrevious={() => setCurrentStep("upload")}
              onRestart={resetFlow}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function createUploadUserId(catName: string) {
  const slug = catName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "guest";
}
