import type { ConversionEngine, EngineContext, EngineFile } from "./types";

function commandFor(file: EngineFile) {
  const outputName = file.name.replace(/\.[^.]+$/, "") + "_unblock.mp4";
  const args = ["-i", file.name];

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

export const ffmpegEngine: ConversionEngine = {
  name: "ffmpeg",
  async convert(files: EngineFile[], context: EngineContext) {
    for (const file of files) {
      const plan = commandFor(file);
      context.post({
        type: "error",
        id: file.id,
        message: `FFmpeg engine is wired next. Planned command: ffmpeg ${plan.args.join(" ")}`
      });
    }
  }
};
