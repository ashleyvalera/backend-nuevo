import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePagoDto {
  @IsNotEmpty({ message: 'El monto del pago es obligatorio' })
  @IsNumber()
  @Min(0.01)
  monto!: number;

  @IsNotEmpty({ message: 'El ID del préstamo es obligatorio' })
  @IsString()
  prestamoId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroCuota?: number;

  @IsOptional()
  @IsString()
  fechaPago?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  recargo?: number;
}