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

function chooseStatus(fileName: string, progress: number) {
  if (progress < 12) return "Analyzing";
  if (/\.(mov|m4v)$/i.test(fileName) && progress < 42) return "Rewrapping";
  if (progress < 100) return "Converting";
  return "Done";
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
        await sleep(120 + index * 24);
        const normalized = Math.min(progress, 100);
        post({
          type: "progress",
          id: file.id,
          progress: normalized,
          status: chooseStatus(file.name, normalized),
          message: normalized < 100 ? "Creating Windows-friendly MP4" : "Ready"
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
