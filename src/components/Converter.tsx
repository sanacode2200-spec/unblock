import { useEffect, useMemo, useRef, useState } from "react";
import { buildConversionPlan, presetLabel } from "../lib/conversionPlan";
import type { ConversionIssue, ConversionPreset, QueueFile, WorkerResponse } from "../lib/conversionMessages";

function formatSize(bytes: number) {
  if (!bytes) return "Size unknown";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function guessIssues(file: File): ConversionIssue[] {
  const name = file.name.toLowerCase();
  const issues: ConversionIssue[] = [];
  if (name.endsWith(".mov")) issues.push("iPhone video format");
  if (name.includes("hevc") || name.includes("h265") || name.endsWith(".mov")) {
    issues.push("May not open on Windows");
  }
  if (name.includes("hdr") || name.includes("dolby")) issues.push("May look washed out");
  if (file.size > 700 * 1024 * 1024 || name.includes("4k")) issues.push("Too large to share");
  return issues.length ? issues : ["Compatibility check"];
}

function outputName(name: string) {
  return name.replace(/\.[^.]+$/, "") + "_unblock.mp4";
}

const presets: ConversionPreset[] = ["windows-mp4", "powerpoint", "editor-safe", "smaller-file"];

type OutputFile = {
  fileName: string;
  url: string;
};

export default function Converter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const selectedFilesRef = useRef<Map<string, File>>(new Map());
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<QueueFile[]>([]);
  const [outputs, setOutputs] = useState<Record<string, OutputFile>>({});
  const [title, setTitle] = useState("Ready to convert");
  const [summary, setSummary] = useState("Unblock selected MP4 · H.264 · AAC · SDR automatically.");
  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState<ConversionPreset>("windows-mp4");
  const [workerReady, setWorkerReady] = useState(false);

  const hasFiles = files.length > 0;
  const buttonText = useMemo(() => {
    if (running) return "Converting";
    if (files.every((file) => file.status === "Done") && hasFiles) return "Convert again";
    return "Convert to MP4";
  }, [files, hasFiles, running]);

  useEffect(() => () => {
    workerRef.current?.terminate();
  }, []);

  function ensureWorker() {
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(new URL("../workers/conversion.worker.ts", import.meta.url), {
      type: "module"
    });

    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === "capabilities") {
        setWorkerReady(true);
        return;
      }
      if (message.type === "progress") {
        setFiles((current) => current.map((file) => (
          file.id === message.id
            ? { ...file, progress: message.progress, status: message.status }
            : file
        )));
        return;
      }
      if (message.type === "complete") {
        setRunning(false);
        setTitle("Your MP4 is ready");
        setSummary("The original video stays untouched. Download output will connect to the ffmpeg.wasm result next.");
        return;
      }
      if (message.type === "result") {
        const url = URL.createObjectURL(message.blob);
        setOutputs((current) => {
          if (current[message.id]) URL.revokeObjectURL(current[message.id].url);
          return {
            ...current,
            [message.id]: {
              fileName: message.fileName,
              url
            }
          };
        });
        return;
      }
      if (message.type === "error") {
        setRunning(false);
        setTitle("This video could not be converted.");
        setSummary(message.message);
        if (message.id) {
          setFiles((current) => current.map((file) => (
            file.id === message.id ? { ...file, status: "Error" } : file
          )));
        }
      }
    });

    workerRef.current = worker;
    return worker;
  }

  function applyPreset(nextPreset: ConversionPreset) {
    setPreset(nextPreset);
    setFiles((current) => current.map((file) => ({
      ...file,
      plan: buildConversionPlan({
        name: file.name,
        size: file.size,
        issues: file.issues,
        preset: nextPreset
      }),
      progress: 0,
      status: "Ready"
    })));
    setTitle("Ready to convert");
    setSummary(`Unblock selected ${presetLabel(nextPreset)} automatically.`);
    setRunning(false);
  }

  function addFiles(list: FileList | null) {
    const videos = Array.from(list ?? []).filter((file) => (
      file.type.startsWith("video/") || /\.(mov|mp4|m4v)$/i.test(file.name)
    ));
    if (!videos.length) return;

    ensureWorker();
    const selectedFiles = new Map<string, File>();
    const queue: QueueFile[] = videos.map((file) => {
      const issues = guessIssues(file);
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      selectedFiles.set(id, file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        issues,
        plan: buildConversionPlan({
          name: file.name,
          size: file.size,
          issues,
          preset
        }),
        progress: 0,
        status: "Ready" as const
      };
    });

    selectedFilesRef.current = selectedFiles;
    setOutputs((current) => {
      Object.values(current).forEach((output) => URL.revokeObjectURL(output.url));
      return {};
    });
    setFiles(queue);
    setTitle("Ready to convert");
    setSummary("Unblock selected MP4 · H.264 · AAC · SDR automatically.");
    setRunning(false);
  }

  function startConversion() {
    if (!hasFiles || running) return;

    const worker = ensureWorker();
    setRunning(true);
    setTitle("Creating Windows-friendly MP4...");
    setSummary(workerReady
      ? "Fast mode is selected when a safe rewrap is enough; otherwise Unblock converts to H.264."
      : "Starting the local conversion worker.");
    setFiles((current) => current.map((file) => ({ ...file, progress: 0, status: "Queued" })));
    worker.postMessage({
      type: "convert",
      preset,
      files: files.flatMap(({ id, name, size, type, issues, plan }) => {
        const source = selectedFilesRef.current.get(id);
        return source ? [{ id, name, size, type, issues, plan, source }] : [];
      })
    });
  }

  return (
    <>
      <div className="hero-actions">
        <label className="button primary" htmlFor="fileInput">Choose a file</label>
        <a className="button secondary" href="#download">Download for Windows</a>
      </div>

      <section className="drop-card" aria-label="Video upload">
        <div
          className={`drop${dragging ? " dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <div className="drop-inner">
            <div className="upload" aria-hidden="true">↑</div>
            <h2>Drop iPhone videos here</h2>
            <p>MOV · HEVC · HDR · 4K · local processing</p>
            <label className="button primary" htmlFor="fileInput">Choose a file</label>
            <input
              id="fileInput"
              ref={inputRef}
              className="file-input"
              type="file"
              accept="video/*,.mov,.mp4,.m4v"
              multiple
              onChange={(event) => addFiles(event.currentTarget.files)}
            />
          </div>
        </div>
      </section>

      <div className="trust-pills" aria-label="Compatibility promises">
        <span className="trust-pill strong">MOV → MP4</span>
        <span className="trust-pill">HEVC → H.264</span>
        <span className="trust-pill">HDR → SDR</span>
        <span className="trust-pill">4K supported</span>
        <span className="trust-pill">Local processing</span>
        <span className="trust-pill">Windows 10 / 11</span>
      </div>

      <div className="presets" aria-label="Output presets">
        {presets.map((presetOption) => (
          <button
            className={`preset${presetOption === preset ? " active" : ""}`}
            key={presetOption}
            type="button"
            aria-pressed={presetOption === preset}
            onClick={() => applyPreset(presetOption)}
          >
            {presetLabel(presetOption)}
          </button>
        ))}
      </div>

      {hasFiles && (
        <section className="converter" aria-live="polite">
          <div className="converter-head">
            <div>
              <strong>{title}</strong>
              <span>{summary}</span>
            </div>
            <button className="button primary" type="button" disabled={running} onClick={startConversion}>
              {buttonText}
            </button>
          </div>
          <div className="file-list">
            {files.map((file) => (
              <div className="file-row" key={file.name}>
                <div className="thumb">MP4</div>
                <div className="file-main">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="meta-chip">Detected: {file.issues.join(" + ")}</span>
                    <span className="meta-chip">Plan: {file.plan.userLabel}</span>
                    <span className="meta-chip">Output: {file.plan.outputLabel}</span>
                    <span className="meta-chip">Estimated: {formatSize(Math.round(file.size * file.plan.estimatedRatio))}</span>
                    <span className="meta-chip">Saves as: {outputName(file.name)}</span>
                  </div>
                </div>
                <div className={`ready${["Queued", "Analyzing", "Rewrapping", "Converting"].includes(file.status) ? " converting" : ""}${file.status === "Done" ? " done" : ""}`} role="status">
                  {outputs[file.id] ? (
                    <a href={outputs[file.id].url} download={outputs[file.id].fileName}>Download</a>
                  ) : file.status}
                </div>
                <div
                  className="progress"
                  aria-label="Conversion progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={file.progress}
                  role="progressbar"
                >
                  <div className="progress-bar" style={{ width: `${file.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="converter-note">
            Prototype mode: this web app shell previews the queue, plain-language analysis, and progress states. The conversion worker will connect here next.
          </p>
        </section>
      )}
    </>
  );
}
