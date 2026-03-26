import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { CepRow } from '../type/cep.type';

@Injectable()
export class CsvCepRepository {
  private readonly logger = new Logger(CsvCepRepository.name);
  private readonly cepIndex = new Map<string, CepRow>();
  private readonly rows: CepRow[] = [];
  private loaded = false;

  async findByCep(cep: string): Promise<CepRow | null> {
    await this.ensureLoaded();
    return this.cepIndex.get(cep) ?? null;
  }

  async findAll(): Promise<CepRow[]> {
    await this.ensureLoaded();
    return this.rows;
  }

  async findWithinRadius(origin: CepRow, raioKm: number): Promise<CepRow[]> {
    await this.ensureLoaded();
    return this.rows.filter((cepRow) => {
      if (cepRow.cep === origin.cep) {
        return false;
      }

      const distanceKm = this.calculateDistanceKm(
        origin.latitude,
        origin.longitude,
        cepRow.latitude,
        cepRow.longitude,
      );

      return distanceKm <= raioKm;
    });
  }

  async findCepCodesWithinRadius(
    origin: CepRow,
    raioKm: number,
  ): Promise<string[]> {
    const cepsWithinRadius = await this.findWithinRadius(origin, raioKm);
    return cepsWithinRadius.map((cepRow) => cepRow.cep);
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }

    const startedAt = Date.now();
    const cpuStart = process.cpuUsage();

    try {
      const csvPath = await this.resolveCsvPath();
      const fileContent = await fs.readFile(csvPath, 'utf-8');
      const lines = fileContent
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);

      for (const line of lines.slice(1)) {
        const [cep, latitudeStr, longitudeStr] = line.split(',');
        const latitude = Number(latitudeStr);
        const longitude = Number(longitudeStr);
        if (!cep || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          continue;
        }

        const row: CepRow = { cep, latitude, longitude };
        this.rows.push(row);
        this.cepIndex.set(cep, row);
      }

      this.loaded = true;
      const elapsedMs = Date.now() - startedAt;
      const cpuDelta = process.cpuUsage(cpuStart);
      this.logger.log(
        JSON.stringify({
          event: 'csv_loaded',
          registros: this.rows.length,
          tempoMs: elapsedMs,
          memoriaHeapMb: this.getHeapUsageMb(),
          cpuUserMs: Math.round(cpuDelta.user / 1000),
          cpuSystemMs: Math.round(cpuDelta.system / 1000),
        }),
      );
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'csv_load_failed',
          message: error instanceof Error ? error.message : 'erro desconhecido',
        }),
      );
      throw new InternalServerErrorException('Falha ao carregar base de CEPs');
    }
  }

  private async resolveCsvPath(): Promise<string> {
    const candidates = [
      path.resolve(process.cwd(), 'src/data/cep-aberto.csv'),
      path.resolve(process.cwd(), 'data/cep-aberto.csv'),
    ];

    for (const candidate of candidates) {
      await fs.access(candidate);
      return candidate;
    }

    throw new Error('Arquivo cep-aberto.csv nao encontrado');
  }

  private getHeapUsageMb(): number {
    return Number((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2));
  }

  private calculateDistanceKm(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): number {
    const earthRadiusKm = 6371;
    const dLat = this.toRadians(destinationLat - originLat);
    const dLng = this.toRadians(destinationLng - originLng);
    const lat1 = this.toRadians(originLat);
    const lat2 = this.toRadians(destinationLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}

export type { CepRow };
