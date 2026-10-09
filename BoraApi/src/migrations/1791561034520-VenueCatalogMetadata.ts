import { MigrationInterface, QueryRunner } from "typeorm";

export class VenueCatalogMetadata1791561034520 implements MigrationInterface {
    name = 'VenueCatalogMetadata1791561034520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venues" ADD "catalog_metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venues" DROP COLUMN "catalog_metadata"`);
    }

}
