import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthTokenTable1786690999031 implements MigrationInterface {
  name = 'AddAuthTokenTable1786690999031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."auth_tokens_type_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET')`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" text NOT NULL, "type" "public"."auth_tokens_type_enum" NOT NULL, "resendCount" integer NOT NULL DEFAULT '0', "userId" integer NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_41e9ddfbb32da18c4e85e45c2fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AUTH_TOKEN_EXPIRES_AT" ON "auth_tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AUTH_TOKEN_HASH" ON "auth_tokens" ("tokenHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AUTH_TOKEN_USER_TYPE_CREATED_AT" ON "auth_tokens" ("userId", "type", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "emailVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_tokens" ADD CONSTRAINT "FK_c25fb956ebada4b256501585cca" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_tokens" DROP CONSTRAINT "FK_c25fb956ebada4b256501585cca"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerified"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_AUTH_TOKEN_USER_TYPE_CREATED_AT"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_AUTH_TOKEN_HASH"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_AUTH_TOKEN_EXPIRES_AT"`);
    await queryRunner.query(`DROP TABLE "auth_tokens"`);
    await queryRunner.query(`DROP TYPE "public"."auth_tokens_type_enum"`);
  }
}
