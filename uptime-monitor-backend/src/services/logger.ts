import { LogEntry } from '../types';

const MAX_ENTRIES = 100;

const logs: LogEntry[] = [];
const errorLogs: LogEntry[] = [];

function formatArgs(args: unknown[]): string {
  return args
    .map((a) =>
      typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a),
    )
    .join(' ');
}

function addEntry(
  store: LogEntry[],
  level: LogEntry['level'],
  args: unknown[],
): void {
  store.push({
    level,
    message: formatArgs(args),
    timestamp: new Date().toISOString(),
  });
  if (store.length > MAX_ENTRIES) {
    store.shift();
  }
}

export function initLogger(): void {
  const originalLog = console.log.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  const originalInfo = console.info.bind(console);
  const originalDebug = console.debug.bind(console);

  console.log = (...args: unknown[]) => {
    addEntry(logs, 'log', args);
    originalLog(...args);
  };

  console.warn = (...args: unknown[]) => {
    addEntry(logs, 'warn', args);
    originalWarn(...args);
  };

  console.info = (...args: unknown[]) => {
    addEntry(logs, 'info', args);
    originalInfo(...args);
  };

  console.debug = (...args: unknown[]) => {
    addEntry(logs, 'debug', args);
    originalDebug(...args);
  };

  console.error = (...args: unknown[]) => {
    addEntry(errorLogs, 'error', args);
    originalError(...args);
  };

  process.on('uncaughtException', (err: Error) => {
    addEntry(errorLogs, 'error', [
      `[uncaughtException] ${err.message}`,
      err.stack ?? '',
    ]);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    addEntry(errorLogs, 'error', [`[unhandledRejection] ${message}`]);
  });
}

export function getLogs(): LogEntry[] {
  return [...logs].reverse();
}

export function getErrors(): LogEntry[] {
  return [...errorLogs].reverse();
}
