import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../users/entities/user.entity";
import { Profile } from "../../profiles/entities/profile.entity";
import { DocumentType } from "../../profiles/enums/document-type.enum";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { Categoria } from "../../categorias/entities/categoria.entity";
import { Prestamo } from "../../prestamos/entities/prestamo.entity";
import { Pago } from "../../pagos/entities/pago.entity";
import { PaymentType } from "../../shared/enums/payment-type.enum";
import { LoanStatus } from "../../shared/enums/loan-status.enum";
import { UserRole } from "../../shared/enums/user-role.enum";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "123456",
  database: "prestamos",
  synchronize: false,
  logging: false,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/**/*.ts"],
});

async function run() {
  await AppDataSource.initialize();

  const users = AppDataSource.getRepository(User);
  const profiles = AppDataSource.getRepository(Profile);
  const usuariosRepo = AppDataSource.getRepository(Usuario);
  const categoriasRepo = AppDataSource.getRepository(Categoria);
  const prestamosRepo = AppDataSource.getRepository(Prestamo);
  const pagosRepo = AppDataSource.getRepository(Pago);

  const existingUsers = await users.count();
  if (existingUsers > 0) {
    console.log("⚠️  Ya existen datos. Abortando seed.");
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 10);

  // ─── USUARIOS DEL SISTEMA ───
  const adminUser = users.create({
    email: "admin@prestamos.com",
    password: passwordHash,
    isActive: true,
    role: UserRole.ADMIN,
  });
  await users.save(adminUser);
  await profiles.save(
    profiles.create({
      firstName: "Admin",
      lastName: "Principal",
      documentType: DocumentType.DNI,
      documentNumber: "12345678",
      phone: "+51 999 888 777",
      user: adminUser,
      userId: adminUser.id,
    }),
  );
  console.log("✅ admin@prestamos.com (ADMIN)");

  const cobradorUser = users.create({
    email: "cobrador@prestamos.com",
    password: passwordHash,
    isActive: true,
    role: UserRole.COBRADOR,
  });
  await users.save(cobradorUser);
  console.log("✅ cobrador@prestamos.com (COBRADOR)");

// ─── CLIENTES (Usuarios) ───
   const clientesData = [
     {
       nombre: "Juan Pérez García",
       documentoTipo: DocumentType.DNI,
       documentoNumero: "87654321",
       telefono: "+51 912 345 678",
       direccion: "Av. Lima 123, San Juan de Lurigancho",
       referencia: "Cerca al parque central",
     },
     {
       nombre: "María López Rodríguez",
       documentoTipo: DocumentType.CE,
       documentoNumero: "AB123456",
       telefono: "+51 987 654 321",
       direccion: "Jr. Tacna 456, Miraflores",
       referencia: "Frente a la iglesia",
     },
     {
       nombre: "Carlos Sánchez Torres",
       documentoTipo: DocumentType.PASAPORTE,
       documentoNumero: "X1234567",
       telefono: "+51 911 222 333",
       direccion: "Av. Arequipa 789, Surquillo",
       referencia: "",
     },
     {
       nombre: "Ana Martínez Flores",
       documentoTipo: DocumentType.DNI,
       documentoNumero: "10123456",
       telefono: "+51 933 444 555",
       direccion: "Calle Junín 321, La Molina",
       referencia: "Alt. cuadra 5",
     },
     {
       nombre: "Pedro Ramírez Castro",
       documentoTipo: DocumentType.RUC,
       documentoNumero: "98765432",
       telefono: "+51 955 666 777",
       direccion: "Av. Brasil 100, Pueblo Libre",
       referencia: "Cerca al mercado",
     },
   ];

   const clientesGuardados: Usuario[] = [];
   for (const c of clientesData) {
     const cli = await usuariosRepo.save(usuariosRepo.create(c));
     clientesGuardados.push(cli);
     console.log(`✅ Cliente: ${c.nombre} (${c.documentoTipo} ${c.documentoNumero})`);
   }

  // ─── CATEGORÍAS ───
  const categoriasData = [
    { nombre: "Personal", descripcion: "Préstamos personales" },
    { nombre: "Negocio", descripcion: "Préstamos para negocios" },
    { nombre: "Emergencia", descripcion: "Préstamos de emergencia" },
    { nombre: "Estudios", descripcion: "Préstamos para estudios" },
    { nombre: "Salud", descripcion: "Préstamos para salud" },
  ];
  const categoriasGuardadas: Categoria[] = [];
  for (const cat of categoriasData) {
    const c = await categoriasRepo.save(categoriasRepo.create(cat));
    categoriasGuardadas.push(c);
    console.log(`✅ Categoría: ${cat.nombre}`);
  }

  // ─── PRÉSTAMOS ───
  const prestamosData = [
    {
      monto: 1000,
      tasaInteres: 10,
      tipoPago: PaymentType.CUOTAS,
      numeroCuotas: 5,
      fechaInicio: "2026-01-15",
      usuarioId: clientesGuardados[0].id,
      categoriaId: categoriasGuardadas[0].id,
      createdById: adminUser.id,
    },
    {
      monto: 2000,
      tasaInteres: 15,
      tipoPago: PaymentType.CUOTAS,
      numeroCuotas: 10,
      fechaInicio: "2026-02-01",
      usuarioId: clientesGuardados[1].id,
      categoriaId: categoriasGuardadas[1].id,
      createdById: adminUser.id,
    },
    {
      monto: 500,
      tasaInteres: 10,
      tipoPago: PaymentType.UNICO,
      numeroCuotas: 1,
      fechaInicio: "2026-03-10",
      fechaFin: "2026-04-10",
      usuarioId: clientesGuardados[2].id,
      categoriaId: categoriasGuardadas[2].id,
      createdById: cobradorUser.id,
    },
    {
      monto: 3000,
      tasaInteres: 12,
      tipoPago: PaymentType.CUOTAS,
      numeroCuotas: 12,
      fechaInicio: "2026-01-01",
      usuarioId: clientesGuardados[3].id,
      categoriaId: categoriasGuardadas[3].id,
      createdById: adminUser.id,
    },
  ];

  const prestamosGuardados: Prestamo[] = [];

  for (const pd of prestamosData) {
    const montoCuota =
      pd.tipoPago === PaymentType.CUOTAS
        ? parseFloat(
            ((pd.monto * (1 + pd.tasaInteres / 100)) / pd.numeroCuotas!).toFixed(2),
          )
        : parseFloat((pd.monto * (1 + pd.tasaInteres / 100)).toFixed(2));

    const prestamo = await prestamosRepo.save(
      prestamosRepo.create({
        ...pd,
        montoCuota,
        estado: LoanStatus.ACTIVO,
        saldoPendiente: pd.monto,
        interesDiario: 0,
      }),
    );
    prestamosGuardados.push(prestamo);

    // Generar cuotas automáticamente
    if (pd.tipoPago === PaymentType.CUOTAS && pd.numeroCuotas && montoCuota) {
      const fechaInicio = new Date(pd.fechaInicio);
      for (let i = 1; i <= pd.numeroCuotas; i++) {
        const fechaVencimiento = new Date(
          fechaInicio.getFullYear(),
          fechaInicio.getMonth() + i,
          fechaInicio.getDate(),
        );
        await pagosRepo.save(
          pagosRepo.create({
            monto: montoCuota,
            montoCuota,
            numeroCuota: i,
            fechaVencimiento: fechaVencimiento.toISOString().split("T")[0],
            prestamoId: prestamo.id,
            pagado: false,
          }),
        );
      }
    }

    console.log(
      `✅ Préstamo: S/${pd.monto} (${pd.tipoPago}) → ${clientesGuardados.find((c) => c.id === pd.usuarioId)?.nombre}`,
    );
  }

  // ─── SIMULAR PAGOS REALIZADOS ───
  // Marcar cuota 1 y 2 del primer préstamo como pagadas
  const primerPrestamo = prestamosGuardados[0];
  const cuotas = await pagosRepo.find({
    where: { prestamoId: primerPrestamo.id },
    order: { numeroCuota: "ASC" },
  });

  let sumaPagosReal = 0;
  for (let i = 0; i < Math.min(2, cuotas.length); i++) {
    cuotas[i].pagado = true;
    cuotas[i].fechaPago = `2026-0${i + 2}-15`;
    cuotas[i].recargo = 0;
    await pagosRepo.save(cuotas[i]);
    sumaPagosReal += cuotas[i].montoCuota || 0;
  }

  // Recalcular saldos pendientes para todos los préstamos
  for (const p of prestamosGuardados) {
    const todasLasCuotas = await pagosRepo.find({
      where: { prestamoId: p.id },
    });
    const totalPagadoCuotas = todasLasCuotas
      .filter((pg) => pg.pagado)
      .reduce((sum, pg) => sum + (pg.montoCuota || 0), 0);

    const montoConInteres = p.monto * (1 + p.tasaInteres / 100);
    p.saldoPendiente = parseFloat(
      Math.max(0, montoConInteres - totalPagadoCuotas).toFixed(2),
    );
    if (p.saldoPendiente <= 0) {
      p.estado = LoanStatus.CANCELADO;
      p.saldoPendiente = 0;
    }
    await prestamosRepo.save(p);
  }

  // ─── RESUMEN ───
  const totalUsers = await users.count();
  const totalClientes = await usuariosRepo.count();
  const totalCat = await categoriasRepo.count();
  const totalPrestamos = await prestamosRepo.count();
  const totalPagos = await pagosRepo.count();

  console.log(`\n🌱 Seed completado:`);
  console.log(`   ${totalUsers} usuarios del sistema`);
  console.log(`   ${totalClientes} clientes`);
  console.log(`   ${totalCat} categorías`);
  console.log(`   ${totalPrestamos} préstamos`);
  console.log(`   ${totalPagos} cuotas registradas`);

  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});