import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { DocumentType } from '../profiles/enums/document-type.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  findByDocumentoNumero(
    documentoTipo: DocumentType,
    documentoNumero: string,
  ): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { documentoTipo, documentoNumero },
    });
  }

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existing = await this.findByDocumentoNumero(
      dto.documentoTipo,
      dto.documentoNumero,
    );
    if (existing) {
      throw new ConflictException(
        `Ya existe un usuario con el documento ${dto.documentoTipo} ${dto.documentoNumero}`,
      );
    }

    const usuario = this.usuarioRepository.create(dto);
    return this.usuarioRepository.save(usuario);
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Si cambia el documento, verificar que no esté duplicado
    if (dto.documentoTipo && dto.documentoNumero) {
      if (
        dto.documentoTipo !== usuario.documentoTipo ||
        dto.documentoNumero !== usuario.documentoNumero
      ) {
        const existing = await this.findByDocumentoNumero(
          dto.documentoTipo,
          dto.documentoNumero,
        );
        if (existing) {
          throw new ConflictException(
            `Ya existe un usuario con el documento ${dto.documentoTipo} ${dto.documentoNumero}`,
          );
        }
      }
    }

    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }

  async delete(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    await this.usuarioRepository.delete(id);
  }
}