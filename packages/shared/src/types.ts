export type CommandMessage = {
  command: string;
  timestamp: number;
};

export type CommandResponse = {
  type: "output" | "error" | "clear";
  data?: string;
  timestamp: number;
};

export type HistoryLine = {
  command: string;
  output: string;
  isError?: boolean;
  timestamp: number;
};
