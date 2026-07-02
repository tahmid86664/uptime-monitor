import type { LogEntry } from '../lib/types';

const levelStyles: Record<LogEntry['level'], string> = {
  log: 'text-zinc-500 dark:text-zinc-400',
  info: 'text-blue-600 dark:text-blue-400',
  warn: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  debug: 'text-purple-600 dark:text-purple-400',
};

interface LogsTableProps {
  entries: LogEntry[];
  emptyMessage?: string;
}

export function LogsTable({
  entries,
  emptyMessage = 'No entries.',
}: LogsTableProps) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto space-y-px">
      {entries.map((entry, i) => (
        <div
          key={i}
          className="flex gap-3 rounded px-2 py-1.5 text-xs font-mono hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
        >
          <span className="shrink-0 text-zinc-400 dark:text-zinc-600">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
          <span
            className={`w-10 shrink-0 font-semibold uppercase ${levelStyles[entry.level]}`}
          >
            {entry.level}
          </span>
          <span className="break-all text-zinc-700 dark:text-zinc-300">
            {entry.message}
          </span>
        </div>
      ))}
    </div>
  );
}
