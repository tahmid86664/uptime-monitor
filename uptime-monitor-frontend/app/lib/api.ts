import type { HealthData, MetricsData, LogEntry } from './types';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api/proxy/${path}`, { cache: 'no-store' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    const msg =
      (body as { error?: string }).error ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export const fetchHealth = (): Promise<HealthData> => get<HealthData>('health');

export const fetchMetrics = (): Promise<MetricsData> =>
  get<MetricsData>('metrics');

export const fetchLogs = (): Promise<{ logs: LogEntry[] }> =>
  get<{ logs: LogEntry[] }>('metrics/logs');

export const fetchErrors = (): Promise<{ errors: LogEntry[] }> =>
  get<{ errors: LogEntry[] }>('metrics/errors');
