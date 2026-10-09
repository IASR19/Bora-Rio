import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessVerification1791571549133 implements MigrationInterface {
    name = 'BusinessVerification1791571549133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "business_cnpj" character varying(14)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_name" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."users_business_verification_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_verification_status" "public"."users_business_verification_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_verification_note" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_contract_file" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_verified_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "events" ADD "created_as_business" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "created_as_business"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_verified_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_contract_file"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_verification_note"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_verification_status"`);
        await queryRunner.query(`DROP TYPE "public"."users_business_verification_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_cnpj"`);
    }

}
