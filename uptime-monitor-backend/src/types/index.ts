export interface LogEntry {
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  nodeVersion: string;
  environment: string;
}

export interface SystemMetrics {
  os: {
    platform: NodeJS.Platform;
    arch: string;
    hostname: string;
    uptime: number;
    type: string;
    release: string;
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usedPercent: number;
  };
  cpu: {
    model: string;
    cores: number;
    speed: number;
  };
  process: {
    pid: number;
    uptime: number;
    nodeVersion: string;
    platform: NodeJS.Platform;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}
