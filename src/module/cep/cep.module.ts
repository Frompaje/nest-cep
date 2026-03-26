import { Module } from '@nestjs/common';
import { CepController } from './controller/cep.controller';
import { CsvCepRepository } from './repository/csv-cep.repository';
import { RequestTelemetryService } from './service/request-telemetry.service';
import { SearchCepsByRadiusUseCase } from './useCase/search-ceps-by-radius.usecase';

@Module({
  imports: [],
  controllers: [CepController],
  providers: [
    SearchCepsByRadiusUseCase,
    CsvCepRepository,
    RequestTelemetryService,
  ],
})
export class CepModule {}
