import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789700736461 implements MigrationInterface {
    name = 'InitialSchema1789700736461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "venues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "name" character varying(160) NOT NULL, "description" text, "category" character varying NOT NULL, "music_genres" text NOT NULL DEFAULT '', "vibes" text NOT NULL DEFAULT '', "price_range" character varying NOT NULL, "address" character varying NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "city" character varying, "cover_image_url" character varying, CONSTRAINT "PK_cb0f885278d12384eb7a81818be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dc83acad11367a8f5ee16c6dbc" ON "venues" ("latitude") `);
        await queryRunner.query(`CREATE INDEX "IDX_7be1316740f13b344131543d4e" ON "venues" ("longitude") `);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "venue_id" uuid NOT NULL, "name" character varying(160) NOT NULL, "description" text, "music_genres" text NOT NULL DEFAULT '', "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE, "target_age" integer, "cover_image_url" character varying, "ticket_url" character varying, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "event_id" uuid NOT NULL, "title" character varying(160) NOT NULL, "valid_from" TIME NOT NULL, "valid_until" TIME NOT NULL, "quantity_total" integer NOT NULL, "quantity_redeemed" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "user_id" uuid NOT NULL, "intentions" text NOT NULL DEFAULT '', "music_genres" text NOT NULL DEFAULT '', "venue_vibes" text NOT NULL DEFAULT '', "age_interest_min" integer, "age_interest_max" integer, "max_distance_km" integer NOT NULL DEFAULT '10', "price_ranges" text NOT NULL DEFAULT '', CONSTRAINT "REL_458057fa75b66e68a275647da2" UNIQUE ("user_id"), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'other', 'undisclosed')`);
        await queryRunner.query(`CREATE TYPE "public"."users_subscription_status_enum" AS ENUM('free', 'active', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "name" character varying(120) NOT NULL, "email" character varying(160) NOT NULL, "password_hash" character varying, "phone" character varying(20) NOT NULL, "phone_verified" boolean NOT NULL DEFAULT false, "birth_date" date NOT NULL, "gender" "public"."users_gender_enum" NOT NULL DEFAULT 'undisclosed', "avatar_url" character varying, "city" character varying, "show_in_who_is_going" boolean NOT NULL DEFAULT true, "subscription_status" "public"."users_subscription_status_enum" NOT NULL DEFAULT 'free', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
        await queryRunner.query(`CREATE TABLE "reward_redemptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "reward_id" uuid NOT NULL, "user_id" uuid NOT NULL, "redeemed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e02d178fa8c54295d8edc8781b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b13532c084052b9d0a749f8ed" ON "reward_redemptions" ("reward_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e40cc924716518bc5d1828ce3" ON "reward_redemptions" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "event_participations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "user_id" uuid NOT NULL, "event_id" uuid NOT NULL, "viewed" boolean NOT NULL DEFAULT false, "interested" boolean NOT NULL DEFAULT false, "confirmed" boolean NOT NULL DEFAULT false, "checked_in" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_1ab6dc53fcef21beb42c457dd17" UNIQUE ("user_id", "event_id"), CONSTRAINT "PK_591a28b162350ee6dea2b08739f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4736789a5a1cd89f4af38a062" ON "event_participations" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_390fd21b5c4e7709dda0026614" ON "event_participations" ("event_id") `);
        await queryRunner.query(`CREATE TABLE "checkins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "user_id" uuid NOT NULL, "event_id" uuid NOT NULL, "qr_nonce" character varying NOT NULL, "checked_in_at" TIMESTAMP WITH TIME ZONE NOT NULL, "device_id" character varying, CONSTRAINT "PK_99c62633386398b154840f0708c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4bee1e59fa58838948f443e531" ON "checkins" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b1d1f5cc7c8d5e17ba66e279d0" ON "checkins" ("event_id") `);
        await queryRunner.query(`CREATE TABLE "phone_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "phone" character varying(20) NOT NULL, "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "consumed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_11ef2c1c5ed828b9636472db666" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6543110a244519b0da53435c47" ON "phone_verifications" ("phone") `);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_26e10dc1ae5cdd5a20279e08b4a" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD CONSTRAINT "FK_7a626477d8ea35f569a4c291dec" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_458057fa75b66e68a275647da2e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" ADD CONSTRAINT "FK_6b13532c084052b9d0a749f8edb" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" ADD CONSTRAINT "FK_8e40cc924716518bc5d1828ce3d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participations" ADD CONSTRAINT "FK_b4736789a5a1cd89f4af38a0623" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participations" ADD CONSTRAINT "FK_390fd21b5c4e7709dda00266140" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkins" ADD CONSTRAINT "FK_4bee1e59fa58838948f443e531f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checkins" ADD CONSTRAINT "FK_b1d1f5cc7c8d5e17ba66e279d0e" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkins" DROP CONSTRAINT "FK_b1d1f5cc7c8d5e17ba66e279d0e"`);
        await queryRunner.query(`ALTER TABLE "checkins" DROP CONSTRAINT "FK_4bee1e59fa58838948f443e531f"`);
        await queryRunner.query(`ALTER TABLE "event_participations" DROP CONSTRAINT "FK_390fd21b5c4e7709dda00266140"`);
        await queryRunner.query(`ALTER TABLE "event_participations" DROP CONSTRAINT "FK_b4736789a5a1cd89f4af38a0623"`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" DROP CONSTRAINT "FK_8e40cc924716518bc5d1828ce3d"`);
        await queryRunner.query(`ALTER TABLE "reward_redemptions" DROP CONSTRAINT "FK_6b13532c084052b9d0a749f8edb"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_458057fa75b66e68a275647da2e"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP CONSTRAINT "FK_7a626477d8ea35f569a4c291dec"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_26e10dc1ae5cdd5a20279e08b4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6543110a244519b0da53435c47"`);
        await queryRunner.query(`DROP TABLE "phone_verifications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b1d1f5cc7c8d5e17ba66e279d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4bee1e59fa58838948f443e531"`);
        await queryRunner.query(`DROP TABLE "checkins"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_390fd21b5c4e7709dda0026614"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4736789a5a1cd89f4af38a062"`);
        await queryRunner.query(`DROP TABLE "event_participations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e40cc924716518bc5d1828ce3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b13532c084052b9d0a749f8ed"`);
        await queryRunner.query(`DROP TABLE "reward_redemptions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_subscription_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TABLE "rewards"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7be1316740f13b344131543d4e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc83acad11367a8f5ee16c6dbc"`);
        await queryRunner.query(`DROP TABLE "venues"`);
    }

}
