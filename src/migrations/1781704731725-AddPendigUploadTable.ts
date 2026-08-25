import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPendigUploadTable1781704731725 implements MigrationInterface {
    name = 'AddPendigUploadTable1781704731725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pending_uploads" ("storageKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24756ba61b884c5754e5d15dfce" PRIMARY KEY ("storageKey"))`);
        await queryRunner.query(`CREATE INDEX "IDX_PENDING_UPLOADS_CREATE_AT" ON "pending_uploads" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_PENDING_UPLOADS_CREATE_AT"`);
        await queryRunner.query(`DROP TABLE "pending_uploads"`);
    }

}
