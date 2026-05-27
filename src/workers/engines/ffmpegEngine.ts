import type { ConversionEngine, EngineContext, EngineFile } from "./types";

let ffmpegPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;
let activeFileId: string | null = null;
let recentLogLines: string[] = [];

type Probe = {
  videoCodec: string;
  audioCodec: string;
  colorTransfer: string;
  width: number;
  height: number;
  frameRate: number;
};

function safeInputName(file: EngineFile) {
  const extension = file.name.match(/\.[^.]+$/)?.[0] ?? ".mov";
  return `input_${file.id.replace(/[^a-z0-9]/gi, "_")}${extension}`;
}

function outputNameFor(file: EngineFile) {
  return file.name.replace(/\.[^.]+$/, "") + "_unblock.mp4";
}

function hasLargeDimension(probe: Probe | null) {
  return probe ? Math.max(probe.width, probe.height) >= 2160 : false;
}

function parseFrameRate(value: string | undefined) {
  if (!value) return 0;
  const [numerator, denominator] = value.split("/").map(Number);
  if (!numerator || !denominator) return Number(value) || 0;
  return numerator / denominator;
}

function canCopyToMp4(file: EngineFile, probe: Probe | null) {
  if (!probe) return file.plan.actions.includes("rewrap") && file.plan.actions.length === 1;
  const compatibleVideo = probe.videoCodec === "h264";
  const compatibleAudio = !probe.audioCodec || ["aac", "mp3", "alac"].includes(probe.audioCodec);
  const hdr = ["smpte2084", "arib-std-b67"].includes(probe.colorTransfer);
  const forcedTranscode = file.plan.actions.includes("compress")
    || file.plan.actions.includes("tone-map-sdr")
    || file.plan.preset === "powerpoint"
    || file.plan.preset === "editor-safe";

  return compatibleVideo && compatibleAudio && !hdr && !forcedTranscode;
}

function canCopyAudio(probe: Probe | null) {
  return !probe?.audioCodec || ["aac", "mp3", "alac"].includes(probe.audioCodec);
}

function videoFilterFor(file: EngineFile, probe: Probe | null) {
  const filters: string[] = [];
  const speedFirst = file.plan.preset !== "editor-safe";

  if (file.plan.actions.includes("tone-map-sdr")) {
    filters.push("zscale=t=linear:npl=100,tonemap=hable,zscale=t=bt709:m=bt709:r=tv");
  }

  if (file.plan.actions.includes("compress") || hasLargeDimension(probe) || speedFirst) {
    filters.push(`scale='min(${speedFirst ? 1280 : 1920},iw)':-2`);
  }

  if (speedFirst && probe && probe.frameRate > 30) {
    filters.push("fps=30");
  }

  return filters.length ? filters.join(",") : null;
}

function commandFor(file: EngineFile, inputName: string, outputName: string, probe: Probe | null) {
  const args = ["-i", inputName, "-map", "0:v:0", "-map", "0:a:0?", "-sn", "-dn"];

  if (canCopyToMp4(file, probe)) {
    args.push("-c", "copy", "-movflags", "+faststart", outputName);
    return { args, outputName };
  }

  args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "ultrafast", "-tune", "fastdecode");

  if (file.plan.actions.includes("compress")) {
    args.push("-crf", "30");
  } else {
    args.push("-crf", "23");
  }

  const videoFilter = videoFilterFor(file, probe);
  if (videoFilter) args.push("-vf", videoFilter);

  args.push("-c:a", canCopyAudio(probe) ? "copy" : "aac", "-movflags", "+faststart");
  args.push(outputName);
  return { args, outputName };
}

function rememberLog(line: string) {
  recentLogLines = [...recentLogLines.slice(-11), line];
  console.info(`[ffmpeg] ${line}`);
}

function conversionError() {
  const suffix = recentLogLines.length ? `\n\nffmpeg log:\n${recentLogLines.join("\n")}` : "";
  return new Error(`This video could not be converted. The file may be damaged or unsupported.${suffix}`);
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
    ffmpeg.on("log", ({ type, message }) => {
      rememberLog(`${type}: ${message}`);
    });

    await ffmpeg.load({
      classWorkerURL: new URL("@ffmpeg/ffmpeg/worker", import.meta.url).toString(),
      coreURL: new URL("@ffmpeg/core", import.meta.url).toString(),
      wasmURL: new URL("@ffmpeg/core/wasm", import.meta.url).toString()
    });

    return ffmpeg;
  })();

  return ffmpegPromise;
}

async function probeFile(ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg, inputName: string): Promise<Probe | null> {
  const outputName = `${inputName}.probe.json`;
  const exitCode = await ffmpeg.ffprobe([
    "-v", "error",
    "-show_entries", "stream=codec_type,codec_name,color_transfer,width,height,avg_frame_rate,r_frame_rate",
    "-of", "json",
    inputName,
    "-o", outputName
  ]);

  if (exitCode !== 0) return null;

  const data = await ffmpeg.readFile(outputName, "utf8");
  await ffmpeg.deleteFile(outputName).catch(() => undefined);
  const text = typeof data === "string" ? data : new TextDecoder().decode(data);
  const parsed = JSON.parse(text) as {
    streams?: Array<{
      codec_type?: string;
      codec_name?: string;
      color_transfer?: string;
      width?: number;
      height?: number;
      avg_frame_rate?: string;
      r_frame_rate?: string;
    }>;
  };
  const video = parsed.streams?.find((stream) => stream.codec_type === "video");
  const audio = parsed.streams?.find((stream) => stream.codec_type === "audio");

  return {
    videoCodec: video?.codec_name ?? "",
    audioCodec: audio?.codec_name ?? "",
    colorTransfer: video?.color_transfer ?? "",
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    frameRate: parseFrameRate(video?.avg_frame_rate) || parseFrameRate(video?.r_frame_rate)
  };
}

export const ffmpegEngine: ConversionEngine = {
  name: "ffmpeg",
  async preload(context: EngineContext) {
    await getFFmpeg(context);
  },
  async convert(files: EngineFile[], context: EngineContext) {
    const { fetchFile } = await import("@ffmpeg/util");
    for (const file of files) {
      const inputName = safeInputName(file);
      const outputName = outputNameFor(file);
      recentLogLines = [];

      context.post({
        type: "progress",
        id: file.id,
        progress: 1,
        status: "Analyzing",
        message: "Loading the local conversion engine"
      });

      const ffmpeg = await getFFmpeg(context);

      await ffmpeg.writeFile(inputName, await fetchFile(file.source));
      const probe = await probeFile(ffmpeg, inputName).catch(() => null);
      const plan = commandFor(file, inputName, outputName, probe);

      activeFileId = file.id;
      const exitCode = await ffmpeg.exec(plan.args).finally(() => {
        activeFileId = null;
      });
      if (exitCode !== 0) {
        throw conversionError();
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
