import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SearchCepsByRadiusDto } from '../dto/search-ceps-by-radius.dto';
import { CsvCepRepository } from '../repository/csv-cep.repository';
import { RequestTelemetryService } from '../service/request-telemetry.service';

@Injectable()
export class SearchCepsByRadiusUseCase {
  private readonly logger = new Logger(SearchCepsByRadiusUseCase.name);

  constructor(
    private readonly csvCepRepository: CsvCepRepository,
    private readonly requestTelemetryService: RequestTelemetryService,
  ) {}

  async execute(query: SearchCepsByRadiusDto) {
    const startedAt = Date.now();
    const cpuStart = process.cpuUsage();

    try {
      const originCep = await this.csvCepRepository.findByCep(query.cep);
      if (!originCep) {
        throw new NotFoundException('CEP inexistente na base');
      }

      const ceps = await this.csvCepRepository.findCepCodesWithinRadius(
        originCep,
        query.raioKm,
      );
      const elapsedMs = Date.now() - startedAt;
      const cpuUsageMs = this.getCpuUsageMs(cpuStart);
      const heapUsageMb = this.getHeapUsageMb();

      this.logger.log(
        JSON.stringify({
          event: 'search_completed',
          cep: query.cep,
          raioKm: query.raioKm,
          totalEncontrado: ceps.length,
          tempoMs: elapsedMs,
        }),
      );

      void this.requestTelemetryService.append({
        event: 'search_telemetry',
        cep: query.cep,
        raioKm: query.raioKm,
        tempoMs: elapsedMs,
        memoriaHeapMb: heapUsageMb,
        cpuUserMs: cpuUsageMs.cpuUserMs,
        cpuSystemMs: cpuUsageMs.cpuSystemMs,
        totalEncontrado: ceps.length,
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      return {
        cepOrigem: query.cep,
        raioKm: query.raioKm,
        total: ceps.length,
        ceps,
      };
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      const errorMessage =
        error instanceof Error ? error.message : 'erro desconhecido';
      const cpuUsageMs = this.getCpuUsageMs(cpuStart);
      const heapUsageMb = this.getHeapUsageMb();

      void this.requestTelemetryService.append({
        event: 'search_telemetry',
        cep: query.cep,
        raioKm: query.raioKm,
        tempoMs: elapsedMs,
        memoriaHeapMb: heapUsageMb,
        cpuUserMs: cpuUsageMs.cpuUserMs,
        cpuSystemMs: cpuUsageMs.cpuSystemMs,
        status: 'error',
        errorMessage,
        createdAt: new Date().toISOString(),
      });

      throw error;
    }
  }

  private getHeapUsageMb(): number {
    return Number((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2));
  }

  private getCpuUsageMs(cpuStart: NodeJS.CpuUsage): {
    cpuUserMs: number;
    cpuSystemMs: number;
  } {
    const cpuUsage = process.cpuUsage(cpuStart);

    return {
      cpuUserMs: Math.round(cpuUsage.user / 1000),
      cpuSystemMs: Math.round(cpuUsage.system / 1000),
    };
  }
}
