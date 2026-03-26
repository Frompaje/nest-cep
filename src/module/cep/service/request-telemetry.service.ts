import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

type RequestTelemetryEntry = {
  event: string;
  cep: string;
  raioKm: number;
  tempoMs: number;
  memoriaHeapMb: number;
  cpuUserMs: number;
  cpuSystemMs: number;
  totalEncontrado?: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: string;
};

@Injectable()
export class RequestTelemetryService {
  private readonly logger = new Logger(RequestTelemetryService.name);

  async append(entry: RequestTelemetryEntry): Promise<void> {
    const logsDir = path.resolve(process.cwd(), 'logs');
    const logFilePath = path.resolve(logsDir, 'telemetry.log');

    try {
      await fs.mkdir(logsDir, { recursive: true });
      await fs.appendFile(logFilePath, `${JSON.stringify(entry)}\n`, 'utf-8');
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'telemetry_write_failed',
          message: error instanceof Error ? error.message : 'erro desconhecido',
        }),
      );
    }
  }
}

export type { RequestTelemetryEntry };
