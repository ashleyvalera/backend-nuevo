import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString, Min, Max } from 'class-validator';
import { PaymentType } from '../../shared/enums/payment-type.enum';
import { LoanStatus } from '../../shared/enums/loan-status.enum';

export class CreatePrestamoDto {
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  @Min(1)
  monto!: number;

  @IsNotEmpty({ message: 'La tasa de interés es obligatoria' })
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaInteres!: number;

  @IsNotEmpty({ message: 'El tipo de pago es obligatorio' })
  @IsEnum(PaymentType)
  tipoPago!: PaymentType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroCuotas?: number;

  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsString()
  fechaInicio!: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  @IsString()
  usuarioId!: string;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsNumber()
  interesDiario?: number;
}

export class UpdatePrestamoDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tasaInteres?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  tipoPago?: PaymentType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroCuotas?: number;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsOptional()
  @IsEnum(LoanStatus)
  estado?: string;
}