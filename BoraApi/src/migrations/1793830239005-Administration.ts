import { MigrationInterface, QueryRunner } from "typeorm";

export class Administration1793830239005 implements MigrationInterface {
    name = 'Administration1793830239005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_audit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_id" uuid NOT NULL, "target_id" uuid NOT NULL, "action" character varying(60) NOT NULL, "changes" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5ad48a4d9d16397ef37e28bb0be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a6e368c9e36b0597f44e93e6a1" ON "admin_audit" ("created_at") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying(16) NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "language" character varying(5) NOT NULL DEFAULT 'pt'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "language"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6e368c9e36b0597f44e93e6a1"`);
        await queryRunner.query(`DROP TABLE "admin_audit"`);
    }

}
