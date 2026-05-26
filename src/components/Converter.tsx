import { useMemo, useRef, useState } from "react";

type QueueFile = {
  name: string;
  size: number;
  issues: string[];
  progress: number;
  status: "Ready" | "Queued" | "Converting" | "Done";
};

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

function guessIssues(file: File) {
  const name = file.name.toLowerCase();
  const issues = [];
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

export default function Converter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<QueueFile[]>([]);
  const [title, setTitle] = useState("Ready to convert");
  const [summary, setSummary] = useState("Unblock selected MP4 · H.264 · AAC · SDR automatically.");
  const [running, setRunning] = useState(false);

  const hasFiles = files.length > 0;
  const buttonText = useMemo(() => {
    if (running) return "Converting";
    if (files.every((file) => file.status === "Done") && hasFiles) return "Convert again";
    return "Convert to MP4";
  }, [files, hasFiles, running]);

  function addFiles(list: FileList | null) {
    const videos = Array.from(list ?? []).filter((file) => (
      file.type.startsWith("video/") || /\.(mov|mp4|m4v)$/i.test(file.name)
    ));
    if (!videos.length) return;

    if (timerRef.current) window.clearInterval(timerRef.current);
    setFiles(videos.map((file) => ({
      name: file.name,
      size: file.size,
      issues: guessIssues(file),
      progress: 0,
      status: "Ready"
    })));
    setTitle("Ready to convert");
    setSummary("Unblock selected MP4 · H.264 · AAC · SDR automatically.");
    setRunning(false);
  }

  function simulateConversion() {
    if (!hasFiles || running) return;

    let progress = 0;
    setRunning(true);
    setTitle("Creating Windows-friendly MP4...");
    setSummary("Fast mode is selected when a safe rewrap is enough; otherwise Unblock converts to H.264.");
    setFiles((current) => current.map((file) => ({ ...file, progress: 0, status: "Queued" })));

    timerRef.current = window.setInterval(() => {
      progress = Math.min(progress + 8, 100);
      setFiles((current) => {
        const next = current.map((file, index) => {
          const localProgress = Math.max(0, Math.min(progress - index * 12, 100));
          return {
            ...file,
            progress: localProgress,
            status: localProgress === 0 ? "Queued" : localProgress < 100 ? "Converting" : "Done"
          } satisfies QueueFile;
        });
        if (next.every((file) => file.progress === 100)) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          timerRef.current = null;
          setRunning(false);
          setTitle("Your MP4 is ready");
          setSummary("The original video stays untouched. The desktop app will open the output folder after conversion.");
        }
        return next;
      });
    }, 220);
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
        <span className="preset active">Windows MP4</span>
        <span className="preset">PowerPoint</span>
        <span className="preset">Premiere Pro</span>
        <span className="preset">Smaller file</span>
      </div>

      {hasFiles && (
        <section className="converter" aria-live="polite">
          <div className="converter-head">
            <div>
              <strong>{title}</strong>
              <span>{summary}</span>
            </div>
            <button className="button primary" type="button" disabled={running} onClick={simulateConversion}>
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
                    <span className="meta-chip">Output: MP4 · H.264 · SDR</span>
                    <span className="meta-chip">Estimated: {formatSize(Math.round(file.size * 0.72))}</span>
                    <span className="meta-chip">Saves as: {outputName(file.name)}</span>
                  </div>
                </div>
                <div className={`ready${file.status === "Converting" || file.status === "Queued" ? " converting" : ""}${file.status === "Done" ? " done" : ""}`} role="status">
                  {file.status}
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
