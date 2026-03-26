import { Transform, Type } from 'class-transformer';
import { IsNumber, IsString, Matches, Min } from 'class-validator';

export class SearchCepsByRadiusDto {
  @IsString()
  @Transform(({ value }: { value: string }) => value.replace(/\D/g, ''))
  @Matches(/^\d{8}$/, { message: 'cep deve conter 8 digitos' })
  cep: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1, { message: 'raioKm deve ser maior que zero' })
  raioKm: number;
}
