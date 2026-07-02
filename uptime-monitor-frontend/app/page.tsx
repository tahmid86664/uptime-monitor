'use client';

import { useEffect, useState } from 'react';
import { fetchHealth, fetchMetrics, fetchLogs, fetchErrors } from './lib/api';
import type { HealthData, LogEntry, MetricsData } from './lib/types';
import { LogsTable } from './components/LogsTable';
import { MetricRow, MetricsCard, ProgressBar } from './components/MetricsCard';
import { StatusBadge } from './components/StatusBadge';

const POLL_INTERVAL_MS = 5_000;

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'loading' | 'ok' | 'error'
  >('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const [healthData, metricsData, logsData, errorsData] =
          await Promise.all([
            fetchHealth(),
            fetchMetrics(),
            fetchLogs(),
            fetchErrors(),
          ]);
        if (!active) return;
        setHealth(healthData);
        setMetrics(metricsData);
        setLogs(logsData.logs);
        setErrors(errorsData.errors);
        setConnectionStatus('ok');
        setFetchError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (!active) return;
        setConnectionStatus('error');
        setFetchError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    void poll();
    const id = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const heapPercent = metrics
    ? Math.round(
        (metrics.process.memoryUsage.heapUsed /
          metrics.process.memoryUsage.heapTotal) *
          100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Server Monitor
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Refreshes every {POLL_INTERVAL_MS / 1_000}s
              {lastUpdated &&
                ` · Last updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
          <StatusBadge status={connectionStatus} />
        </div>

        {fetchError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
            <strong>Connection error:&nbsp;</strong>
            {fetchError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricsCard title="Health">
            <MetricRow label="Status" value={health?.status ?? '—'} />
            <MetricRow label="Environment" value={health?.environment ?? '—'} />
            <MetricRow
              label="Node version"
              value={health?.nodeVersion ?? '—'}
            />
            <MetricRow
              label="Process uptime"
              value={health ? formatUptime(health.uptime) : '—'}
            />
            <MetricRow
              label="Last checked"
              value={
                health ? new Date(health.timestamp).toLocaleTimeString() : '—'
              }
            />
          </MetricsCard>

          <MetricsCard title="System">
            <MetricRow label="Hostname" value={metrics?.os.hostname ?? '—'} />
            <MetricRow
              label="OS"
              value={metrics ? `${metrics.os.type} ${metrics.os.release}` : '—'}
            />
            <MetricRow label="Platform" value={metrics?.os.platform ?? '—'} />
            <MetricRow label="Architecture" value={metrics?.os.arch ?? '—'} />
            <MetricRow
              label="OS uptime"
              value={metrics ? formatUptime(metrics.os.uptime) : '—'}
            />
          </MetricsCard>

          <MetricsCard title="CPU">
            <MetricRow label="Model" value={metrics?.cpu.model ?? '—'} />
            <MetricRow label="Cores" value={metrics?.cpu.cores ?? '—'} />
            <MetricRow
              label="Speed"
              value={metrics ? `${metrics.cpu.speed} MHz` : '—'}
            />
            <MetricRow
              label="Load (1 min)"
              value={metrics?.os.loadAverage[0]?.toFixed(2) ?? '—'}
            />
            <MetricRow
              label="Load (5 min)"
              value={metrics?.os.loadAverage[1]?.toFixed(2) ?? '—'}
            />
            <MetricRow
              label="Load (15 min)"
              value={metrics?.os.loadAverage[2]?.toFixed(2) ?? '—'}
            />
          </MetricsCard>

          <MetricsCard title="System Memory">
            {metrics ? (
              <>
                <ProgressBar value={metrics.memory.usedPercent} label="Usage" />
                <div className="mt-4">
                  <MetricRow
                    label="Total"
                    value={formatBytes(metrics.memory.total)}
                  />
                  <MetricRow
                    label="Used"
                    value={formatBytes(metrics.memory.used)}
                  />
                  <MetricRow
                    label="Free"
                    value={formatBytes(metrics.memory.free)}
                  />
                </div>
              </>
            ) : (
              <p className="py-4 text-sm text-zinc-400">Loading…</p>
            )}
          </MetricsCard>

          <MetricsCard title="Process Memory (Heap)">
            {metrics ? (
              <>
                <ProgressBar value={heapPercent} label="Heap usage" />
                <div className="mt-4">
                  <MetricRow
                    label="Heap used"
                    value={formatBytes(metrics.process.memoryUsage.heapUsed)}
                  />
                  <MetricRow
                    label="Heap total"
                    value={formatBytes(metrics.process.memoryUsage.heapTotal)}
                  />
                  <MetricRow
                    label="RSS"
                    value={formatBytes(metrics.process.memoryUsage.rss)}
                  />
                  <MetricRow
                    label="External"
                    value={formatBytes(metrics.process.memoryUsage.external)}
                  />
                </div>
              </>
            ) : (
              <p className="py-4 text-sm text-zinc-400">Loading…</p>
            )}
          </MetricsCard>

          <MetricsCard title="Process">
            <MetricRow label="PID" value={metrics?.process.pid ?? '—'} />
            <MetricRow
              label="Node version"
              value={metrics?.process.nodeVersion ?? '—'}
            />
            <MetricRow
              label="Platform"
              value={metrics?.process.platform ?? '—'}
            />
            <MetricRow
              label="Uptime"
              value={metrics ? formatUptime(metrics.process.uptime) : '—'}
            />
          </MetricsCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MetricsCard title={`Console Logs (${logs.length})`}>
            <LogsTable
              entries={logs}
              emptyMessage="No console logs captured yet."
            />
          </MetricsCard>

          <MetricsCard title={`Errors (${errors.length})`}>
            <LogsTable
              entries={errors}
              emptyMessage="No errors captured. All clear!"
            />
          </MetricsCard>
        </div>
      </div>
    </div>
  );
}
