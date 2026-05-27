import type { QueueFile, WorkerResponse } from "../../lib/conversionMessages";

export type EngineFile = Pick<QueueFile, "id" | "name" | "size" | "type" | "issues" | "plan"> & {
  source: File;
};

export type EngineContext = {
  post: (message: WorkerResponse) => void;
};

export type ConversionEngine = {
  name: string;
  preload?: (context: EngineContext) => Promise<void>;
  convert: (files: EngineFile[], context: EngineContext) => Promise<void>;
};
