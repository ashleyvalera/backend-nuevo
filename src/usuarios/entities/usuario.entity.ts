import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prestamo } from '../../prestamos/entities/prestamo.entity';
import { DocumentType } from '../../profiles/enums/document-type.enum';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({
    name: 'documento_tipo',
    type: 'enum',
    enum: DocumentType,
  })
  documentoTipo!: DocumentType;

  @Column({ name: 'documento_numero', type: 'varchar', length: 20 })
  documentoNumero!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ type: 'text', nullable: true })
  direccion!: string | null;

  @Column({ type: 'text', nullable: true })
  referencia!: string | null;

  @Column({ name: 'nombre_negocio', type: 'varchar', length: 100, nullable: true })
  nombreNegocio!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Prestamo, (p) => p.usuario)
  prestamos!: Prestamo[];
}