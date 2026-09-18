import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavorites1789754013816 implements MigrationInterface {
    name = 'AddFavorites1789754013816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "user_id" uuid NOT NULL, "venue_id" uuid NOT NULL, CONSTRAINT "PK_favorites_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_favorites_user_venue" ON "favorites" ("user_id", "venue_id")`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_favorites_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_venue"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_favorites_user_venue"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
    }

}
