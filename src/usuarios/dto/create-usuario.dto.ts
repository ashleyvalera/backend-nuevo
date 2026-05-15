import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { DocumentType } from '../../profiles/enums/document-type.enum';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre!: string;

  @IsNotEmpty({
    message: 'El tipo de documento es obligatorio',
  })
  @IsEnum(DocumentType, {
    message:
      'El tipo de documento debe ser DNI, CE, PASAPORTE o RUC',
  })
  documentoTipo!: DocumentType;

  @IsNotEmpty({
    message: 'El número de documento es obligatorio',
  })
  @IsString()
  @MinLength(1, {
    message: 'El número de documento debe tener al menos 1 carácter',
  })
  @MaxLength(20, {
    message: 'El número de documento no puede exceder 20 caracteres',
  })
  documentoNumero!: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'El nombre del negocio no puede exceder 100 caracteres',
  })
  nombreNegocio?: string;
}