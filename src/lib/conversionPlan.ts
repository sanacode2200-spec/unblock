import type { ConversionIssue, ConversionPlan, ConversionPreset } from "./conversionMessages";

type PlanInput = {
  name: string;
  size: number;
  issues: ConversionIssue[];
  preset: ConversionPreset;
};

const presetLabels: Record<ConversionPreset, string> = {
  "windows-mp4": "Windows MP4",
  powerpoint: "PowerPoint",
  "editor-safe": "Editor safe",
  "smaller-file": "Smaller file"
};

export function presetLabel(preset: ConversionPreset) {
  return presetLabels[preset];
}

export function buildConversionPlan({ name, size, issues, preset }: PlanInput): ConversionPlan {
  const lowerName = name.toLowerCase();
  const actions: ConversionPlan["actions"] = [];
  const movFile = /\.(mov|m4v)$/i.test(lowerName);
  const likelyHevc = issues.includes("May not open on Windows") || lowerName.includes("hevc") || lowerName.includes("h265");
  const likelyHdr = issues.includes("May look washed out") || lowerName.includes("hdr") || lowerName.includes("dolby");
  const shouldCompress = preset === "smaller-file" || size > 700 * 1024 * 1024 || lowerName.includes("4k");

  if (movFile && !likelyHevc && !likelyHdr && !shouldCompress) {
    actions.push("rewrap");
  } else {
    if (movFile) actions.push("rewrap");
    if (likelyHevc || preset === "powerpoint" || preset === "editor-safe") actions.push("transcode-h264");
    if (likelyHdr) actions.push("tone-map-sdr");
    if (shouldCompress) actions.push("compress");
  }

  if (!actions.length) actions.push("rewrap");

  const estimatedRatio = actions.includes("compress")
    ? 0.48
    : actions.includes("transcode-h264") || actions.includes("tone-map-sdr")
      ? 0.72
      : 0.98;

  const userLabel = actions.length === 1 && actions[0] === "rewrap"
    ? "Fast MP4 copy"
    : [
        actions.includes("transcode-h264") ? "H.264 for Windows" : null,
        actions.includes("tone-map-sdr") ? "normal colors" : null,
        actions.includes("compress") ? "smaller file" : null
      ].filter(Boolean).join(" + ");

  return {
    preset,
    actions,
    outputLabel: `MP4 · H.264 · AAC · SDR · ${presetLabels[preset]}`,
    userLabel,
    estimatedRatio
  };
}
