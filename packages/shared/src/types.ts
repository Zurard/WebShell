export type CommandMessage = {
  command: string;
  timestamp: number;
};

export type OutputFormat = "text" | "list" | "table" | "json" | "path" | "success" | "error";

export type StructuredOutput = {
  format: OutputFormat;
  content: string | string[] | Record<string, string>;
  metadata?: {
    itemCount?: number;
    isEmpty?: boolean;
  };
};

export type CommandResponse = {
  type: "output" | "error" | "clear";
  data?: string;
  structured?: StructuredOutput;
  timestamp: number;
};

export type HistoryLine = {
  command: string;
  output: string;
  isError?: boolean;
  timestamp: number;
};
// packages/shared/src/types.ts