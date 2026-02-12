type ConsoleLevel = "log" | "info" | "warn" | "error";

type BoopConsoleEntry = {
  level: ConsoleLevel;
  message: string;
  timestamp: number;
};

type StackSnapshot = {
  trace?: string;
  console?: BoopConsoleEntry[];
};

const MAX_CONSOLE_ENTRIES = 50;
const MAX_MESSAGE_LENGTH = 500;
const MAX_ERROR_AGE_MS = 5 * 60 * 1000;

let captureInstalled = false;
const consoleBuffer: BoopConsoleEntry[] = [];
const originalConsole: Partial<Record<ConsoleLevel, (...args: unknown[]) => void>> = {};
let lastErrorStack: string | undefined;
let lastErrorTimestamp: number | undefined;

const formatArg = (arg: unknown) => {
  if (arg instanceof Error) {
    return arg.stack ?? arg.message;
  }
  if (typeof arg === "string") {
    return arg;
  }
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
};

const pushEntry = (level: ConsoleLevel, args: unknown[]) => {
  const message = args.map(formatArg).join(" ").slice(0, MAX_MESSAGE_LENGTH);
  consoleBuffer.push({ level, message, timestamp: Date.now() });
  if (consoleBuffer.length > MAX_CONSOLE_ENTRIES) {
    consoleBuffer.splice(0, consoleBuffer.length - MAX_CONSOLE_ENTRIES);
  }
};

const recordErrorStack = (error: unknown) => {
  if (error instanceof Error && error.stack) {
    lastErrorStack = error.stack;
    lastErrorTimestamp = Date.now();
  }
};

export const ensureConsoleCapture = () => {
  if (captureInstalled || typeof window === "undefined") {
    return;
  }
  captureInstalled = true;

  (["log", "info", "warn", "error"] as ConsoleLevel[]).forEach((level) => {
    const original = console[level]?.bind(console);
    if (!original) {
      return;
    }
    originalConsole[level] = original;
    console[level] = (...args: unknown[]) => {
      pushEntry(level, args);
      if (level === "error") {
        const errorArg = args.find((arg) => arg instanceof Error);
        recordErrorStack(errorArg);
      }
      original(...args);
    };
  });

  window.addEventListener("error", (event) => {
    recordErrorStack(event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    recordErrorStack(event.reason);
  });
};

export const getStackSnapshot = (): StackSnapshot | undefined => {
  const trace =
    lastErrorTimestamp && Date.now() - lastErrorTimestamp < MAX_ERROR_AGE_MS
      ? lastErrorStack
      : undefined;
  const consoleEntries = consoleBuffer.slice();
  const snapshot: StackSnapshot = {
    trace: trace || undefined,
    console: consoleEntries.length ? consoleEntries : undefined
  };

  return snapshot.trace || snapshot.console ? snapshot : undefined;
};
