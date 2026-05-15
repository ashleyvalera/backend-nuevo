import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Prestamo } from '../prestamos/entities/prestamo.entity';
import { LoanStatus } from '../shared/enums/loan-status.enum';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly dataSource: DataSource,
  ) {}

  private getPrestamoRepository() {
    return this.dataSource.getRepository(Prestamo);
  }

  async create(dto: CreatePagoDto): Promise<{ pago: Pago; prestamo: Prestamo }> {
    const prestamoRepo = this.getPrestamoRepository();
    const prestamo = await prestamoRepo.findOne({
      where: { id: dto.prestamoId },
      relations: ['pagos'],
    });

    if (!prestamo) {
      throw new NotFoundException(
        `Préstamo con ID ${dto.prestamoId} no encontrado`,
      );
    }

    if (prestamo.estado !== 'ACTIVO') {
      throw new NotFoundException(
        `El préstamo no está activo (estado: ${prestamo.estado})`,
      );
    }

    const totalPagado = prestamo.pagos
      ? prestamo.pagos.reduce(
          (sum, p) => sum + (p.pagado ? p.monto : 0),
          0,
        )
      : 0;

    const montoConInteres = prestamo.monto * (1 + prestamo.tasaInteres / 100);
    const nuevoTotalPagado = totalPagado + dto.monto;

    if (nuevoTotalPagado > montoConInteres + (prestamo.interesDiario || 0)) {
      throw new NotFoundException(
        `El monto del pago excede el saldo pendiente`,
      );
    }

    const pago = this.pagoRepository.create({
      monto: dto.monto,
      numeroCuota: dto.numeroCuota ?? null,
      fechaPago: dto.fechaPago ?? new Date().toISOString().split('T')[0],
      recargo: dto.recargo ?? 0,
      prestamoId: dto.prestamoId,
      pagado: true,
      fechaVencimiento: null,
    });

    await this.pagoRepository.save(pago);

    const totalPagos = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .where('pago.prestamoId = :id', { id: dto.prestamoId })
      .getRawOne();

    const sumaPagos = totalPagos ? parseFloat(totalPagos.total) || 0 : 0;

    prestamo.saldoPendiente = parseFloat(
      Math.max(0, prestamo.monto - sumaPagos).toFixed(2),
    );

    if (prestamo.saldoPendiente <= 0) {
      prestamo.estado = LoanStatus.CANCELADO;
      prestamo.saldoPendiente = 0;
    }

    await prestamoRepo.save(prestamo);

    if (dto.numeroCuota) {
      await this.pagoRepository.update(
        { prestamoId: dto.prestamoId, numeroCuota: dto.numeroCuota },
        { pagado: true },
      );
    }

    return { pago, prestamo };
  }

  findAll(): Promise<Pago[]> {
    return this.pagoRepository.find({
      relations: ['prestamo'],
      order: { createdAt: 'DESC' },
    });
  }

  findByPrestamo(prestamoId: string): Promise<Pago[]> {
    return this.pagoRepository.find({
      where: { prestamoId },
      order: { createdAt: 'ASC' },
    });
  }
}