import "server-only";

type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export const logger = {
  info(message: string, context?: LogContext) {
    writeLog("info", message, context);
  },
  warn(message: string, context?: LogContext) {
    writeLog("warn", message, context);
  },
  error(message: string, context?: LogContext) {
    writeLog("error", message, context);
  },
};
