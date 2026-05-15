import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/create-prestamo.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Get()
  findAll() {
    return this.prestamosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prestamosService.findOne(id);
  }

  @Get(':id/pagos')
  findPagos(@Param('id') id: string) {
    return this.prestamosService.getPagosByPrestamo(id);
  }

  @Get(':id/saldo')
  findSaldo(@Param('id') id: string) {
    return this.prestamosService.findOne(id).then((p) => {
      if (!p) throw new Error('Préstamo no encontrado');
      return { saldoPendiente: p.saldoPendiente };
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreatePrestamoDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.prestamosService.create(dto, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrestamoDto) {
    return this.prestamosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.prestamosService.delete(id);
  }
}