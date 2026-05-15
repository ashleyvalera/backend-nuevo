import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prestamo } from './entities/prestamo.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamo, Pago])],
  providers: [PrestamosService],
  controllers: [PrestamosController],
  exports: [PrestamosService],
})
export class PrestamosModule {}