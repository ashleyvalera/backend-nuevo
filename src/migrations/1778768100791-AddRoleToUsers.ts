import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUsers1778768100791 implements MigrationInterface {
  name = "AddRoleToUsers1778768100791";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'COBRADOR'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "public"."users_role_enum" NOT NULL DEFAULT 'COBRADOR'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}