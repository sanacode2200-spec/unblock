import type { ConversionEngine, EngineContext, EngineFile } from "./types";

let ffmpegPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;
let activeFileId: string | null = null;

function safeInputName(file: EngineFile) {
  const extension = file.name.match(/\.[^.]+$/)?.[0] ?? ".mov";
  return `input_${file.id.replace(/[^a-z0-9]/gi, "_")}${extension}`;
}

function outputNameFor(file: EngineFile) {
  return file.name.replace(/\.[^.]+$/, "") + "_unblock.mp4";
}

function commandFor(file: EngineFile, inputName: string, outputName: string) {
  const args = ["-i", inputName];

  if (file.plan.actions.includes("rewrap") && file.plan.actions.length === 1) {
    args.push("-c", "copy", "-movflags", "+faststart", outputName);
    return { args, outputName };
  }

  args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart");

  if (file.plan.actions.includes("tone-map-sdr")) {
    args.push("-vf", "zscale=t=linear:npl=100,tonemap=hable,zscale=t=bt709:m=bt709:r=tv");
  }

  if (file.plan.actions.includes("compress")) {
    args.push("-crf", "26", "-preset", "veryfast");
  } else {
    args.push("-crf", "20", "-preset", "fast");
  }

  args.push(outputName);
  return { args, outputName };
}

async function getFFmpeg(context: EngineContext) {
  if (ffmpegPromise) return ffmpegPromise;

  ffmpegPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();

    ffmpeg.on("progress", ({ progress }) => {
      if (!activeFileId) return;
      context.post({
        type: "progress",
        id: activeFileId,
        progress: Math.max(1, Math.min(Math.round(progress * 100), 99)),
        status: "Converting"
      });
    });

    await ffmpeg.load({
      coreURL: new URL("@ffmpeg/core", import.meta.url).toString(),
      wasmURL: new URL("@ffmpeg/core/wasm", import.meta.url).toString()
    });

    return ffmpeg;
  })();

  return ffmpegPromise;
}

export const ffmpegEngine: ConversionEngine = {
  name: "ffmpeg",
  async convert(files: EngineFile[], context: EngineContext) {
    const { fetchFile } = await import("@ffmpeg/util");
    const ffmpeg = await getFFmpeg(context);

    for (const file of files) {
      const inputName = safeInputName(file);
      const outputName = outputNameFor(file);
      const plan = commandFor(file, inputName, outputName);

      context.post({
        type: "progress",
        id: file.id,
        progress: 1,
        status: "Analyzing",
        message: "Preparing local conversion"
      });

      await ffmpeg.writeFile(inputName, await fetchFile(file.source));

      activeFileId = file.id;
      const exitCode = await ffmpeg.exec(plan.args).finally(() => {
        activeFileId = null;
      });
      if (exitCode !== 0) {
        throw new Error("This video could not be converted. The file may be damaged or unsupported.");
      }

      const data = await ffmpeg.readFile(outputName);
      const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
      const outputBytes = new Uint8Array(bytes.byteLength);
      outputBytes.set(bytes);

      context.post({
        type: "result",
        id: file.id,
        fileName: outputName,
        blob: new Blob([outputBytes.buffer], { type: "video/mp4" })
      });
      context.post({ type: "progress", id: file.id, progress: 100, status: "Done", message: "Ready" });

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName)
      ]);
    }
  }
};
