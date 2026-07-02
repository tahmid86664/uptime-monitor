interface MetricsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function MetricsCard({
  title,
  children,
  className = '',
}: MetricsCardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
}

export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  label: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const color =
    value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
          {value}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
