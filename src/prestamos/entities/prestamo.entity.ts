import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { User } from '../../users/entities/user.entity';
import { Pago } from '../../pagos/entities/pago.entity';
import { LoanStatus } from '../../shared/enums/loan-status.enum';
import { PaymentType } from '../../shared/enums/payment-type.enum';

@Entity({ name: 'prestamos' })
export class Prestamo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tasaInteres!: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CUOTAS,
  })
  tipoPago!: PaymentType;

  @Column({ type: 'int', nullable: true })
  numeroCuotas!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoCuota!: number | null;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.ACTIVO,
  })
  estado!: LoanStatus;

  @Column({ type: 'date' })
  fechaInicio!: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin!: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoPendiente!: number;

  @Column({ name: 'interes_diario', type: 'decimal', precision: 5, scale: 2, default: 0 })
  interesDiario!: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria | null;

  @Column({ name: 'categoria_id', type: 'uuid', nullable: true })
  categoriaId!: string | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  creadoPor!: User;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Pago, (pago) => pago.prestamo)
  pagos!: Pago[];
}