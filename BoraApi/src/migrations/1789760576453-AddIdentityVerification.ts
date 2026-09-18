import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdentityVerification1789760576453 implements MigrationInterface {
    name = 'AddIdentityVerification1789760576453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "cpf" character varying(11)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_cpf" ON "users" ("cpf")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "selfie_url" character varying`);

        await queryRunner.query(`ALTER TABLE "venues" ADD "cnpj" character varying(14)`);
        await queryRunner.query(`CREATE INDEX "IDX_venues_cnpj" ON "venues" ("cnpj")`);

        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "trust_score"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "trust_score" integer`);

        await queryRunner.query(`DROP INDEX "public"."IDX_venues_cnpj"`);
        await queryRunner.query(`ALTER TABLE "venues" DROP COLUMN "cnpj"`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "selfie_url"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_cpf"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cpf"`);
    }

}
