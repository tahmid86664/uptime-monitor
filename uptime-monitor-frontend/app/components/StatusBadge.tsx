type Status = 'ok' | 'error' | 'loading';

const config: Record<Status, { label: string; dot: string; badge: string }> = {
  ok: {
    label: 'Online',
    dot: 'bg-emerald-500 animate-pulse',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400',
  },
  error: {
    label: 'Offline',
    dot: 'bg-red-500',
    badge:
      'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-400',
  },
  loading: {
    label: 'Connecting…',
    dot: 'bg-yellow-500 animate-pulse',
    badge:
      'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-950 dark:text-yellow-400',
  },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, dot, badge } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
