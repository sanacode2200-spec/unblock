import type { QueueFile, WorkerResponse } from "../../lib/conversionMessages";

export type EngineFile = Pick<QueueFile, "id" | "name" | "size" | "type" | "issues" | "plan">;

export type EngineContext = {
  post: (message: WorkerResponse) => void;
};

export type ConversionEngine = {
  name: string;
  convert: (files: EngineFile[], context: EngineContext) => Promise<void>;
};
