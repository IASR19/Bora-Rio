import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailVerification1794269491253 implements MigrationInterface {
    name = 'EmailVerification1794269491253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "phone_verified" TO "email_verified"`);
        // O gerador tratou a troca como renomeação, mas telefone confirmado não é e-mail confirmado.
        // Só quem entrou pelo Google já tem o e-mail confirmado; os demais confirmam no próximo acesso.
        await queryRunner.query(`UPDATE "users" SET "email_verified" = ("google_id" IS NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "email_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "user_id" uuid NOT NULL, "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "consumed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c4f1838323ae1dff5aa0014891" ON "email_verifications" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c4f1838323ae1dff5aa0014891"`);
        await queryRunner.query(`DROP TABLE "email_verifications"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "email_verified" TO "phone_verified"`);
    }

}
