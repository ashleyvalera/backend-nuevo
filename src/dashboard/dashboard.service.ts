import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from '../prestamos/entities/prestamo.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoanStatus } from '../shared/enums/loan-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepository: Repository<Prestamo>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async getResumen() {
    const totalPrestadoResult = await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .select('SUM(prestamo.monto)', 'total')
      .getRawOne();
    const totalPrestado = parseFloat(totalPrestadoResult?.total) || 0;

    const totalCobradoResult = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .where('pago.pagado = true')
      .getRawOne();
    const totalCobrado = parseFloat(totalCobradoResult?.total) || 0;

    const totalPendiente = parseFloat(
      Math.max(0, totalPrestado - totalCobrado).toFixed(2),
    );

    const prestamosActivos = await this.prestamoRepository.count({
      where: { estado: LoanStatus.ACTIVO },
    });

    const prestamosCancelados = await this.prestamoRepository.count({
      where: { estado: LoanStatus.CANCELADO },
    });

    const prestamosMorosos = await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .where('prestamo.estado = :estado', { estado: LoanStatus.ACTIVO })
      .andWhere('prestamo.saldoPendiente > 0')
      .getCount();

    const hoyStr = new Date().toISOString().split('T')[0];

    const pagosHoy = await this.pagoRepository
      .createQueryBuilder('pago')
      .where('DATE(pago.createdAt) = :hoy', { hoy: hoyStr })
      .getCount();

    const totalIntereses = totalCobrado > totalPrestado
      ? parseFloat((totalCobrado - totalPrestado).toFixed(2))
      : 0;

    return {
      totalPrestado,
      totalCobrado,
      totalPendiente,
      totalIntereses,
      prestamosActivos,
      prestamosCancelados,
      prestamosMorosos,
      pagosHoy,
      totalClientes: await this.usuarioRepository.count(),
    };
  }

  async getPagosDelDia(): Promise<Pago[]> {
    const hoyStr = new Date().toISOString().split('T')[0];
    return this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.prestamo', 'prestamo')
      .where('DATE(pago.fechaPago) = :hoy', { hoy: hoyStr })
      .orderBy('pago.createdAt', 'DESC')
      .getMany();
  }

  async getClientesMorosos(): Promise<any[]> {
    return this.prestamoRepository
      .createQueryBuilder('prestamo')
.select([
         'prestamo.id',
         'prestamo.monto',
         'prestamo.saldoPendiente',
         'prestamo.estado',
         'prestamo.createdAt',
         'usuario.id',
         'usuario.nombre',
         'usuario.documentoTipo',
         'usuario.documentoNumero',
       ])
      .leftJoin('prestamo.usuario', 'usuario')
      .where('prestamo.estado = :estado', { estado: LoanStatus.ACTIVO })
      .andWhere('prestamo.saldoPendiente > 0')
      .orderBy('prestamo.saldoPendiente', 'DESC')
      .getMany();
  }
}