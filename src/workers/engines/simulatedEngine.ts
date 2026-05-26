import type { EngineFile, ConversionEngine, EngineContext } from "./types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chooseStatus(file: EngineFile, progress: number) {
  if (progress < 12) return "Analyzing";
  if (file.plan.actions.includes("rewrap") && progress < 42) return "Rewrapping";
  if (progress < 100) return "Converting";
  return "Done";
}

function progressStepDelay(file: EngineFile, fileIndex: number) {
  const actionCost = file.plan.actions.reduce((total, action) => {
    if (action === "rewrap") return total + 26;
    if (action === "compress") return total + 56;
    if (action === "tone-map-sdr") return total + 64;
    return total + 48;
  }, 70);

  return actionCost + fileIndex * 24;
}

function progressMessage(file: EngineFile, progress: number) {
  if (progress < 12) return "Checking the video";
  if (file.plan.actions.includes("rewrap") && progress < 42) return "Copying into MP4";
  if (file.plan.actions.includes("tone-map-sdr") && progress < 70) return "Fixing colors for Windows";
  if (file.plan.actions.includes("compress") && progress < 92) return "Making the file smaller";
  return progress < 100 ? "Creating Windows-friendly MP4" : "Ready";
}

export const simulatedEngine: ConversionEngine = {
  name: "simulated",
  async convert(files: EngineFile[], context: EngineContext) {
    for (const [index, file] of files.entries()) {
      context.post({ type: "progress", id: file.id, progress: 0, status: "Queued" });

      for (let progress = 8; progress <= 100; progress += 8) {
        await sleep(progressStepDelay(file, index));
        const normalized = Math.min(progress, 100);
        context.post({
          type: "progress",
          id: file.id,
          progress: normalized,
          status: chooseStatus(file, normalized),
          message: progressMessage(file, normalized)
        });
      }
    }
  }
};
