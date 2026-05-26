import type { WorkerRequest, WorkerResponse } from "../lib/conversionMessages";
import { simulatedEngine } from "./engines/simulatedEngine";

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

post({
  type: "capabilities",
  webCodecs: Boolean(workerScope.VideoEncoder && workerScope.VideoDecoder),
  crossOriginIsolated: workerScope.crossOriginIsolated
});

workerScope.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== "convert") return;

  try {
    await simulatedEngine.convert(event.data.files, { post });
    post({ type: "complete" });
  } catch {
    post({
      type: "error",
      message: "This video could not be converted. The file may be damaged or unsupported."
    });
  }
});
