import {
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { DocumentType } from '../../profiles/enums/document-type.enum';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEnum(DocumentType, {
    message:
      'El tipo de documento debe ser DNI, CE, PASAPORTE o RUC',
  })
  documentoTipo?: DocumentType;

  @IsOptional()
  @IsString()
  @MinLength(1, {
    message: 'El número de documento debe tener al menos 1 carácter',
  })
  @MaxLength(20, {
    message: 'El número de documento no puede exceder 20 caracteres',
  })
  documentoNumero?: string;

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