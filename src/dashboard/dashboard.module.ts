import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prestamo } from '../prestamos/entities/prestamo.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamo, Pago, Usuario])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}