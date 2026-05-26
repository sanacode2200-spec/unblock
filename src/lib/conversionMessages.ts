export type ConversionIssue =
  | "iPhone video format"
  | "May not open on Windows"
  | "May look washed out"
  | "Too large to share"
  | "Compatibility check";

export type QueueFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  issues: ConversionIssue[];
  plan: ConversionPlan;
  progress: number;
  status: "Ready" | "Queued" | "Analyzing" | "Rewrapping" | "Converting" | "Done" | "Error";
};

export type ConversionPreset = "windows-mp4" | "powerpoint" | "editor-safe" | "smaller-file";

export type ConversionAction = "rewrap" | "transcode-h264" | "tone-map-sdr" | "compress";

export type ConversionPlan = {
  preset: ConversionPreset;
  actions: ConversionAction[];
  outputLabel: string;
  userLabel: string;
  estimatedRatio: number;
};

export type WorkerRequest =
  | {
      type: "convert";
      preset: ConversionPreset;
      files: Array<Pick<QueueFile, "id" | "name" | "size" | "type" | "issues" | "plan">>;
    };

export type WorkerResponse =
  | {
      type: "capabilities";
      webCodecs: boolean;
      crossOriginIsolated: boolean;
    }
  | {
      type: "progress";
      id: string;
      progress: number;
      status: QueueFile["status"];
      message?: string;
    }
  | {
      type: "complete";
    }
  | {
      type: "error";
      id?: string;
      message: string;
    };
