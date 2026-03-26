import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (!port) {
    logger.error('Variavel de ambiente PORT nao definida');
    process.exit(1);
  }

  await app.listen(port);
  logger.log(`Aplicacao iniciada na porta ${port}`);
}

void bootstrap();
