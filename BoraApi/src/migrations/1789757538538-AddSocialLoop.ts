import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSocialLoop1789757538538 implements MigrationInterface {
    name = 'AddSocialLoop1789757538538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "follower_id" uuid NOT NULL, "following_id" uuid NOT NULL, CONSTRAINT "PK_follows_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_follows_follower_following" ON "follows" ("follower_id", "following_id")`);
        await queryRunner.query(`ALTER TABLE "follows" ADD CONSTRAINT "FK_follows_follower" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follows" ADD CONSTRAINT "FK_follows_following" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "blocked_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "blocker_id" uuid NOT NULL, "blocked_id" uuid NOT NULL, CONSTRAINT "PK_blocked_users_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_blocked_users_blocker_blocked" ON "blocked_users" ("blocker_id", "blocked_id")`);
        await queryRunner.query(`ALTER TABLE "blocked_users" ADD CONSTRAINT "FK_blocked_users_blocker" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocked_users" ADD CONSTRAINT "FK_blocked_users_blocked" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TYPE "public"."conversations_type_enum" AS ENUM('event_room', 'direct')`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "type" "public"."conversations_type_enum" NOT NULL, "event_id" uuid, "user_a_id" uuid, "user_b_id" uuid, CONSTRAINT "PK_conversations_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_conversations_event_id" ON "conversations" ("event_id")`);

        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "conversation_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "body" text NOT NULL, CONSTRAINT "PK_messages_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_conversation_id" ON "messages" ("conversation_id")`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "deu_bora_interests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "event_id" uuid NOT NULL, "from_user_id" uuid NOT NULL, "to_user_id" uuid NOT NULL, CONSTRAINT "PK_deu_bora_interests_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_deu_bora_interests_event_from_to" ON "deu_bora_interests" ("event_id", "from_user_id", "to_user_id")`);
        await queryRunner.query(`ALTER TABLE "deu_bora_interests" ADD CONSTRAINT "FK_deu_bora_interests_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deu_bora_interests" ADD CONSTRAINT "FK_deu_bora_interests_from_user" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deu_bora_interests" ADD CONSTRAINT "FK_deu_bora_interests_to_user" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deu_bora_interests" DROP CONSTRAINT "FK_deu_bora_interests_to_user"`);
        await queryRunner.query(`ALTER TABLE "deu_bora_interests" DROP CONSTRAINT "FK_deu_bora_interests_from_user"`);
        await queryRunner.query(`ALTER TABLE "deu_bora_interests" DROP CONSTRAINT "FK_deu_bora_interests_event"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_deu_bora_interests_event_from_to"`);
        await queryRunner.query(`DROP TABLE "deu_bora_interests"`);

        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_sender"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_conversation_id"`);
        await queryRunner.query(`DROP TABLE "messages"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_conversations_event_id"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TYPE "public"."conversations_type_enum"`);

        await queryRunner.query(`ALTER TABLE "blocked_users" DROP CONSTRAINT "FK_blocked_users_blocked"`);
        await queryRunner.query(`ALTER TABLE "blocked_users" DROP CONSTRAINT "FK_blocked_users_blocker"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_blocked_users_blocker_blocked"`);
        await queryRunner.query(`DROP TABLE "blocked_users"`);

        await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_follows_following"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_follows_follower"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_follows_follower_following"`);
        await queryRunner.query(`DROP TABLE "follows"`);
    }

}
