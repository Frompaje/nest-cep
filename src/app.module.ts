import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CepModule } from './module/cep/cep.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CepModule],
})
export class AppModule {}
