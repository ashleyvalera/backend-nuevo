import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prestamo } from './entities/prestamo.entity';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/create-prestamo.dto';
import { PaymentType } from '../shared/enums/payment-type.enum';
import { LoanStatus } from '../shared/enums/loan-status.enum';
import { Pago } from '../pagos/entities/pago.entity';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepository: Repository<Prestamo>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Prestamo[]> {
    return this.prestamoRepository.find({
      relations: ['usuario', 'categoria', 'creadoPor'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string): Promise<Prestamo | null> {
    return this.prestamoRepository.findOne({
      where: { id },
      relations: ['usuario', 'categoria', 'creadoPor', 'pagos'],
    });
  }

  findByUsuario(usuarioId: string): Promise<Prestamo[]> {
    return this.prestamoRepository.find({
      where: { usuarioId },
      relations: ['usuario', 'categoria', 'creadoPor'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreatePrestamoDto, creadoById: string): Promise<Prestamo> {
    let montoCuota: number | null = null;
    let numeroCuotas: number | null = null;

    if (dto.tipoPago === PaymentType.CUOTAS) {
      if (!dto.numeroCuotas || dto.numeroCuotas < 1) {
        throw new ConflictException(
          'Número de cuotas es obligatorio para pagos por cuotas',
        );
      }
      const montoConInteres = dto.monto * (1 + dto.tasaInteres / 100);
      montoCuota = parseFloat((montoConInteres / dto.numeroCuotas).toFixed(2));
      numeroCuotas = dto.numeroCuotas;
    } else {
      numeroCuotas = 1;
      montoCuota = parseFloat(
        (dto.monto * (1 + dto.tasaInteres / 100)).toFixed(2),
      );
    }

    const fechaInicio = new Date(dto.fechaInicio);
    let fechaFin: Date | null = null;
    if (dto.fechaFin) {
      fechaFin = new Date(dto.fechaFin);
    } else if (numeroCuotas && dto.tipoPago === PaymentType.CUOTAS) {
      fechaFin = new Date(
        fechaInicio.getFullYear(),
        fechaInicio.getMonth() + numeroCuotas,
        fechaInicio.getDate(),
      );
    }

    const prestamo = this.prestamoRepository.create({
      monto: dto.monto,
      tasaInteres: dto.tasaInteres,
      tipoPago: dto.tipoPago,
      numeroCuotas,
      montoCuota,
      estado: LoanStatus.ACTIVO,
      fechaInicio,
      fechaFin,
      saldoPendiente: dto.monto,
      interesDiario: dto.interesDiario ?? 0,
      usuarioId: dto.usuarioId,
      categoriaId: dto.categoriaId ?? null,
      createdById: creadoById,
    });

    await this.prestamoRepository.save(prestamo);

    if (dto.tipoPago === PaymentType.CUOTAS && numeroCuotas && montoCuota) {
      const cuotasCreadas = await this.generarCuotas(
        prestamo.id,
        numeroCuotas,
        montoCuota,
        fechaInicio,
      );
      prestamo.pagos = cuotasCreadas;
    }

    return prestamo;
  }

  async update(
    id: string,
    dto: UpdatePrestamoDto,
  ): Promise<Prestamo> {
    const prestamo = await this.findOne(id);
    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }

    if (dto.estado) {
      prestamo.estado = dto.estado as LoanStatus;
    }
    if (dto.tasaInteres !== undefined) {
      prestamo.tasaInteres = dto.tasaInteres;
    }
    if (dto.tipoPago) {
      prestamo.tipoPago = dto.tipoPago;
    }
    if (dto.fechaFin) {
      prestamo.fechaFin = new Date(dto.fechaFin);
    }

    return this.prestamoRepository.save(prestamo);
  }

  async delete(id: string): Promise<void> {
    const prestamo = await this.findOne(id);
    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }
    await this.prestamoRepository.delete(id);
  }

  async getPagosByPrestamo(
    prestamoId: string,
  ): Promise<{ pagos: Pago[]; totalPagado: number }> {
    const pagos = await this.pagoRepository.find({
      where: { prestamoId },
      order: { createdAt: 'ASC' },
    });

    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);

    return { pagos, totalPagado };
  }

  getSaldoPendiente(prestamo: Prestamo): number {
    return parseFloat((prestamo.monto - prestamo.saldoPendiente).toFixed(2));
  }

  private async generarCuotas(
    prestamoId: string,
    numeroCuotas: number,
    montoCuota: number,
    fechaInicio: Date,
  ): Promise<Pago[]> {
    const cuotas: Pago[] = [];

    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date(
        fechaInicio.getFullYear(),
        fechaInicio.getMonth() + i,
        fechaInicio.getDate(),
      );

      const cuota = this.pagoRepository.create({
        monto: montoCuota,
        montoCuota: montoCuota,
        numeroCuota: i,
        fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
        prestamoId,
        pagado: false,
      });

      await this.pagoRepository.save(cuota);
      cuotas.push(cuota);
    }

    return cuotas;
  }
}