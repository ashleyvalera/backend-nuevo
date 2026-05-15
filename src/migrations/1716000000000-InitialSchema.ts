import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1716000000000 implements MigrationInterface {
  name = "InitialSchema1716000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear extensión uuid-ossp (idempotente)
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    );

    // Crear tipo enum para document_type (idempotente)
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."profiles_document_type_enum" AS ENUM('DNI', 'CE', 'PASAPORTE', 'RUC'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
    );

    // Crear tabla users (idempotente)
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "public"."users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )`
    );

    // Crear tabla profiles (idempotente)
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "public"."profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "document_type" "public"."profiles_document_type_enum" NOT NULL,
        "document_number" character varying NOT NULL,
        "phone" character varying,
        "birth_date" date,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_profile_document" UNIQUE ("document_type", "document_number"),
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_profiles_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
      )`
    );

    // Índice en user_id
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_profiles_user_id" ON "public"."profiles" ("user_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."users"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."profiles_document_type_enum"`
    );
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}