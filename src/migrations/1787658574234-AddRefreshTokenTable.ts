import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenTable1787658574234 implements MigrationInterface {
  name = 'AddRefreshTokenTable1787658574234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."refresh_tokens_revokereason_enum" AS ENUM('ROTATED', 'LOGOUT', 'REUSE', 'PASSWORD_CHANGED', 'PASSWORD_RESET')`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" text NOT NULL, "familyId" uuid NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "revokeReason" "public"."refresh_tokens_revokereason_enum", "userAgent" text, "ipAddress" character varying(45), "userId" integer NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REFRESH_TOKEN_EXPIRES_AT" ON "refresh_tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REFRESH_TOKEN_USER" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REFRESH_TOKEN_FAMILY" ON "refresh_tokens" ("familyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REFRESH_TOKEN_HASH" ON "refresh_tokens" ("tokenHash") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_REFRESH_TOKEN_HASH"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_REFRESH_TOKEN_FAMILY"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_REFRESH_TOKEN_USER"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_REFRESH_TOKEN_EXPIRES_AT"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(
      `DROP TYPE "public"."refresh_tokens_revokereason_enum"`,
    );
  }
}
