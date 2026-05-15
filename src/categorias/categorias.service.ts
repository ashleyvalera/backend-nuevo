import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/create-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find({ order: { nombre: 'ASC' } });
  }

  findOne(id: string): Promise<Categoria | null> {
    return this.categoriaRepository.findOne({ where: { id } });
  }

  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    const existing = await this.categoriaRepository.findOne({
      where: { nombre: dto.nombre },
    });
    if (existing) {
      throw new ConflictException(
        `La categoría "${dto.nombre}" ya existe`,
      );
    }

    const categoria = this.categoriaRepository.create(dto);
    return this.categoriaRepository.save(categoria);
  }

  async update(id: string, dto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    if (dto.nombre) {
      const existing = await this.categoriaRepository.findOne({
        where: { nombre: dto.nombre },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `La categoría "${dto.nombre}" ya existe`,
        );
      }
    }

    Object.assign(categoria, dto);
    return this.categoriaRepository.save(categoria);
  }

  async delete(id: string): Promise<void> {
    const categoria = await this.findOne(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    await this.categoriaRepository.delete(id);
  }
}