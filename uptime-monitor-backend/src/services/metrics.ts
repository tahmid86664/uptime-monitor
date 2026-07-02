import os from 'os';
import { SystemMetrics } from '../types';

export function getSystemMetrics(): SystemMetrics {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    os: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      type: os.type(),
      release: os.release(),
      loadAverage: os.loadavg(),
    },
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usedPercent: Math.round((usedMem / totalMem) * 100),
    },
    cpu: {
      model: cpus[0]?.model ?? 'Unknown',
      cores: cpus.length,
      speed: cpus[0]?.speed ?? 0,
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
  };
}
