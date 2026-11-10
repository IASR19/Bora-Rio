import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessAccounts1794248336980 implements MigrationInterface {
    name = 'BusinessAccounts1794248336980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`ALTER TABLE "venues" ADD "owner_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "account_type" character varying(16) NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_ai_note" text`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD "kind" character varying(16) NOT NULL DEFAULT 'gift'`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD "price_cents" integer`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD "percent_off" integer`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "quantity_total" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_7aac40883e44792703a817056f" ON "venues" ("owner_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
        // Dados legados: o fluxo antigo permitia o mesmo CNPJ em mais de uma conta. Mantém o CNPJ
        // na conta aprovada (ou na mais antiga) e libera nas demais, senão o índice único falha.
        await queryRunner.query(`
            UPDATE "users" u SET "business_cnpj" = NULL
            FROM (
                SELECT "id", ROW_NUMBER() OVER (
                    PARTITION BY "business_cnpj"
                    ORDER BY ("business_verification_status" = 'approved') DESC, "created_at" ASC
                ) AS rn
                FROM "users"
                WHERE "business_cnpj" IS NOT NULL AND "deleted_at" IS NULL
            ) d
            WHERE u."id" = d."id" AND d.rn > 1`);
        // O parecer da IA dos cadastros em análise passa a ser só do admin; quem está aguardando vê a mensagem padrão.
        await queryRunner.query(`
            UPDATE "users"
            SET "business_ai_note" = "business_verification_note",
                "business_verification_note" = 'Recebemos seu cadastro. Nossa equipe vai analisar o contrato social e liberar seu acesso.'
            WHERE "business_verification_status" = 'pending'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4b733bc227711cdad4773b5702" ON "users" ("business_cnpj") WHERE "deleted_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4b733bc227711cdad4773b5702"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aac40883e44792703a817056f"`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "quantity_total" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP COLUMN "percent_off"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP COLUMN "price_cents"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP COLUMN "kind"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_ai_note"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "account_type"`);
        await queryRunner.query(`ALTER TABLE "venues" DROP COLUMN "owner_user_id"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
    }

}
