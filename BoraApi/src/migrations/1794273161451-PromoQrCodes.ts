import { MigrationInterface, QueryRunner } from "typeorm";

export class PromoQrCodes1794273161451 implements MigrationInterface {
    name = 'PromoQrCodes1794273161451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "promo_scans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "reward_id" uuid NOT NULL, "user_id" uuid, "device_id" character varying(64), "existing_user" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_63c4707890aa25929287936c2e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3a47993f8ba4c4e2615059c119" ON "promo_scans" ("reward_id") `);
        // Passo de dados (à mão): o gerador criaria a coluna já NOT NULL, o que falha com contas
        // existentes. Cria vazia, dá a cada conta (inclusive excluídas) um código único `BORA-XXXXX`
        // (alfabeto sem 0/O/1/I, o mesmo do app), conferindo colisão, e só então exige o valor.
        await queryRunner.query(`ALTER TABLE "users" ADD "public_code" character varying(10)`);
        await queryRunner.query(`
            DO $$
            DECLARE
                alphabet CONSTANT text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
                account record;
                candidate text;
            BEGIN
                FOR account IN SELECT "id" FROM "users" WHERE "public_code" IS NULL LOOP
                    LOOP
                        candidate := 'BORA-';
                        FOR i IN 1..5 LOOP
                            candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
                        END LOOP;
                        EXIT WHEN NOT EXISTS (SELECT 1 FROM "users" WHERE "public_code" = candidate);
                    END LOOP;
                    UPDATE "users" SET "public_code" = candidate WHERE "id" = account."id";
                END LOOP;
            END $$`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "public_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "signup_reward_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD "qr_code" character varying(16)`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" ADD "source" character varying(16) NOT NULL DEFAULT 'checkin'`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" ADD "expires_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" ADD "delivered_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0268dd5138eb3376238ef3a7f5" ON "users" ("public_code") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_213c38e3865a76dda31efe3c03" ON "rewards" ("qr_code") `);
        await queryRunner.query(`ALTER TABLE "promo_scans" ADD CONSTRAINT "FK_3a47993f8ba4c4e2615059c119d" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promo_scans" DROP CONSTRAINT "FK_3a47993f8ba4c4e2615059c119d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_213c38e3865a76dda31efe3c03"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0268dd5138eb3376238ef3a7f5"`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" DROP COLUMN "delivered_at"`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP COLUMN "qr_code"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "signup_reward_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "public_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a47993f8ba4c4e2615059c119"`);
        await queryRunner.query(`DROP TABLE "promo_scans"`);
    }

}
