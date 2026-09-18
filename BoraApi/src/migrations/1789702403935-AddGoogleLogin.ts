import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleLogin1789702403935 implements MigrationInterface {
    name = 'AddGoogleLogin1789702403935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "google_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "birth_date" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0bd5012aeb82628e07f6a1be53" ON "users" ("google_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0bd5012aeb82628e07f6a1be53"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "birth_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    }

}
