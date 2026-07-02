export interface LogEntry {
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: string;
}

export interface HealthData {
  status: 'ok';
  timestamp: string;
  uptime: number;
  nodeVersion: string;
  environment: string;
}

export interface MetricsData {
  os: {
    platform: string;
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
    platform: string;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
  };
}
