import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Prestamo } from '../../prestamos/entities/prestamo.entity';

@Entity({ name: 'pagos' })
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ type: 'int', nullable: true })
  numeroCuota!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoCuota!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  recargo!: number;

  @Column({ type: 'boolean', default: false })
  pagado!: boolean;

  @Column({ type: 'date', nullable: true })
  fechaPago!: string | null;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento!: string | null;

  @ManyToOne(() => Prestamo, { nullable: false })
  @JoinColumn({ name: 'prestamo_id' })
  prestamo!: Prestamo;

  @Column({ name: 'prestamo_id', type: 'uuid' })
  prestamoId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}