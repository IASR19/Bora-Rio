import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventCreationAndTrust1789755066178 implements MigrationInterface {
    name = 'AddEventCreationAndTrust1789755066178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venues" ADD "verified" boolean NOT NULL DEFAULT true`);

        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('pending_review', 'published', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "events" ADD "status" "public"."events_status_enum" NOT NULL DEFAULT 'published'`);
        await queryRunner.query(`ALTER TABLE "events" ADD "trust_score" integer`);

        await queryRunner.query(`CREATE TYPE "public"."reports_target_type_enum" AS ENUM('event', 'venue', 'user')`);
        await queryRunner.query(`CREATE TYPE "public"."reports_category_enum" AS ENUM('comportamento_inadequado', 'perfil_falso', 'assedio', 'spam', 'fraude', 'outro')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "reporter_id" uuid NOT NULL, "target_type" "public"."reports_target_type_enum" NOT NULL, "target_id" uuid NOT NULL, "category" "public"."reports_category_enum" NOT NULL, "message" text, CONSTRAINT "PK_reports_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_reports_target" ON "reports" ("target_type", "target_id")`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_reports_reporter" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_reporter"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_reports_target"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_target_type_enum"`);

        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "trust_score"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);

        await queryRunner.query(`ALTER TABLE "venues" DROP COLUMN "verified"`);
    }

}
