import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsuariosSchema1778768100792 implements MigrationInterface {
  name = "UpdateUsuariosSchema1778768100792";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renombrar columna nombres → nombre
    await queryRunner.query(
      `ALTER TABLE "usuarios" RENAME COLUMN "nombres" TO "nombre"`,
    );

    // Eliminar columna apellidos
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN "apellidos"`,
    );

    // Renombrar columna dni → documento_numero
    await queryRunner.query(
      `ALTER TABLE "usuarios" RENAME COLUMN "dni" TO "documento_numero"`,
    );

    // Ampliar documento_numero de varchar(8) a varchar(20)
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "documento_numero" TYPE varchar(20)`,
    );

    // Eliminar unique constraint anterior (UQ_usuarios_dni)
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP CONSTRAINT "UQ_usuarios_dni"`,
    );

    // Agregar columna documento_tipo
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN "documento_tipo" varchar NOT NULL DEFAULT 'DNI'`,
    );

    // Agregar columna nombre_negocio
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN "nombre_negocio" varchar(100)`,
    );

    // Nuevo índice único en documento_tipo + documento_numero
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_usuarios_documento" ON "usuarios" ("documento_tipo", "documento_numero")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_usuarios_documento"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN "nombre_negocio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP COLUMN "documento_tipo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "documento_numero" TYPE varchar(8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" RENAME COLUMN "documento_numero" TO "dni"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN "apellidos" character varying(100) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" RENAME COLUMN "nombre" TO "nombres"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_usuarios_dni" UNIQUE ("dni")`,
    );
  }
}