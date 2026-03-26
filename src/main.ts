import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;

  if (!port) {
    logger.error('Variavel de ambiente PORT nao definida');
    process.exit(1);
  }

  await app.listen(port);
  logger.log(`Aplicacao iniciada na porta ${port}`);
}

void bootstrap();
