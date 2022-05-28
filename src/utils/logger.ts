type LogType = "log" | "info" | "warn" | "error";

function show(type: LogType, ...args: any[]): void {
  console[type](`[${new Date().toLocaleString()}]`,...args);
};

export function log(...args: any[]): void {
  show("log", ...args);
};

export function info(...args: any[]): void {
  show("info", ...args);
};

export function warn(...args: any[]): void {
  show("warn", ...args);
};

export function error(...args: any[]): void {
  show("error", ...args);
}