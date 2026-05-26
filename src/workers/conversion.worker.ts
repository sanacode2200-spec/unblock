import type { WorkerRequest, WorkerResponse } from "../lib/conversionMessages";

type ConversionWorkerScope = typeof globalThis & {
  postMessage: (message: WorkerResponse) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WorkerRequest>) => void | Promise<void>
  ) => void;
  setTimeout: typeof setTimeout;
  crossOriginIsolated: boolean;
  VideoEncoder?: unknown;
  VideoDecoder?: unknown;
};

const workerScope = self as ConversionWorkerScope;

function post(message: WorkerResponse) {
  workerScope.postMessage(message);
}

function sleep(ms: number) {
  return new Promise((resolve) => workerScope.setTimeout(resolve, ms));
}

function chooseStatus(file: WorkerRequest["files"][number], progress: number) {
  if (progress < 12) return "Analyzing";
  if (file.plan.actions.includes("rewrap") && progress < 42) return "Rewrapping";
  if (progress < 100) return "Converting";
  return "Done";
}

function progressStepDelay(file: WorkerRequest["files"][number], fileIndex: number) {
  const actionCost = file.plan.actions.reduce((total, action) => {
    if (action === "rewrap") return total + 26;
    if (action === "compress") return total + 56;
    if (action === "tone-map-sdr") return total + 64;
    return total + 48;
  }, 70);

  return actionCost + fileIndex * 24;
}

function progressMessage(file: WorkerRequest["files"][number], progress: number) {
  if (progress < 12) return "Checking the video";
  if (file.plan.actions.includes("rewrap") && progress < 42) return "Copying into MP4";
  if (file.plan.actions.includes("tone-map-sdr") && progress < 70) return "Fixing colors for Windows";
  if (file.plan.actions.includes("compress") && progress < 92) return "Making the file smaller";
  return progress < 100 ? "Creating Windows-friendly MP4" : "Ready";
}

post({
  type: "capabilities",
  webCodecs: Boolean(workerScope.VideoEncoder && workerScope.VideoDecoder),
  crossOriginIsolated: workerScope.crossOriginIsolated
});

workerScope.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== "convert") return;

  try {
    for (const [index, file] of event.data.files.entries()) {
      post({ type: "progress", id: file.id, progress: 0, status: "Queued" });

      for (let progress = 8; progress <= 100; progress += 8) {
        await sleep(progressStepDelay(file, index));
        const normalized = Math.min(progress, 100);
        post({
          type: "progress",
          id: file.id,
          progress: normalized,
          status: chooseStatus(file, normalized),
          message: progressMessage(file, normalized)
        });
      }
    }

    post({ type: "complete" });
  } catch {
    post({
      type: "error",
      message: "This video could not be converted. The file may be damaged or unsupported."
    });
  }
});
