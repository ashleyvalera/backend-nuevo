import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsuariosCategoriasPrestamosPagos1778768100790 implements MigrationInterface {
  name = "AddUsuariosCategoriasPrestamosPagos1778768100790";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Tabla: categorias ───
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "public"."categorias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(50) NOT NULL,
        "descripcion" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categorias_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categorias_nombre" UNIQUE ("nombre")
      )`
    );

    // ─── Tabla: usuarios (clientes/prestatarios) ───
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "public"."usuarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombres" character varying(100) NOT NULL,
        "apellidos" character varying(100) NOT NULL,
        "dni" character varying(8) NOT NULL,
        "telefono" character varying(20),
        "direccion" text,
        "referencia" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usuarios_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usuarios_dni" UNIQUE ("dni")
      )`
    );

    // ─── ENUM: tipoPago y estado para prestamos ───
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."prestamos_tipopago_enum" AS ENUM('CUOTAS', 'UNICO'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."prestamos_estado_enum" AS ENUM('ACTIVO', 'CANCELADO', 'MORA'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
    );

    // ─── Tabla: prestamos ───
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "public"."prestamos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "monto" numeric(10,2) NOT NULL,
        "tasaInteres" numeric(5,2) NOT NULL,
        "tipoPago" "public"."prestamos_tipopago_enum" NOT NULL DEFAULT 'CUOTAS',
        "numeroCuotas" integer,
        "montoCuota" numeric(10,2),
        "estado" "public"."prestamos_estado_enum" NOT NULL DEFAULT 'ACTIVO',
        "fechaInicio" date NOT NULL,
        "fechaFin" date,
        "saldoPendiente" numeric(10,2) NOT NULL DEFAULT 0,
        "interes_diario" numeric(5,2) NOT NULL DEFAULT 0,
        "usuario_id" uuid NOT NULL,
        "categoria_id" uuid,
        "created_by" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prestamos_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_prestamos_usuario" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_prestamos_categoria" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_prestamos_creador" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`
    );

    // ─── Tabla: pagos ───
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "public"."pagos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "monto" numeric(10,2) NOT NULL,
        "numeroCuota" integer,
        "montoCuota" numeric(10,2),
        "recargo" numeric(10,2) NOT NULL DEFAULT 0,
        "pagado" boolean NOT NULL DEFAULT false,
        "fechaPago" date,
        "fecha_vencimiento" date,
        "prestamo_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pagos_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pagos_prestamo" FOREIGN KEY ("prestamo_id") REFERENCES "public"."prestamos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`
    );

    // ─── Índices ───
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_prestamos_usuario" ON "public"."prestamos" ("usuario_id")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_prestamos_estado" ON "public"."prestamos" ("estado")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pagos_prestamo" ON "public"."pagos" ("prestamo_id")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_usuarios_dni" ON "public"."usuarios" ("dni")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_usuarios_dni"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_pagos_prestamo"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_prestamos_estado"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_prestamos_usuario"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."pagos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."prestamos"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."prestamos_estado_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."prestamos_tipopago_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."usuarios"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."categorias"`);
  }
}