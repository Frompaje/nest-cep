import { Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchCepsByRadiusDto } from '../dto/search-ceps-by-radius.dto';
import { SearchCepsByRadiusUseCase } from '../useCase/search-ceps-by-radius.usecase';

@Controller('ceps')
export class CepController {
  private readonly logger = new Logger(CepController.name);

  constructor(
    private readonly searchCepsByRadiusUseCase: SearchCepsByRadiusUseCase,
  ) {}

  @Get('radius')
  async searchByRadius(@Query() query: SearchCepsByRadiusDto) {
    this.logger.log(`Request: Raio ${query.raioKm}km do CEP ${query.cep}`);
    try {
      return await this.searchCepsByRadiusUseCase.execute(query);
    } catch (error) {
      this.logger.error(`Falha na busca: ${error.message}`, error.stack);
      throw error;
    }
  }
}
