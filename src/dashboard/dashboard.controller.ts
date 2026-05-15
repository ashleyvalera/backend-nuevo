import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  getResumen() {
    return this.dashboardService.getResumen();
  }

  @Get('pagos-del-dia')
  getPagosDelDia() {
    return this.dashboardService.getPagosDelDia();
  }

  @Get('clientes-morosos')
  getClientesMorosos() {
    return this.dashboardService.getClientesMorosos();
  }
}