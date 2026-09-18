import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDirectConversationUniqueIndex1789758089102 implements MigrationInterface {
    name = 'AddDirectConversationUniqueIndex1789758089102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_conversations_direct_pair" ON "conversations" ("user_a_id", "user_b_id") WHERE "type" = 'direct'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_conversations_direct_pair"`);
    }

}
