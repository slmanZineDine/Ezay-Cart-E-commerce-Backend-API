import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReviewsTable1780519014673 implements MigrationInterface {
  name = 'UpdateReviewsTable1780519014673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop foreign keys constraints temporary
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"`,
    );

    // 2. Safe alter column for comment (No data loss)
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "comment" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "comment" SET NOT NULL`,
    );

    // 3. Set foreign key columns to NOT NULL
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "productId" SET NOT NULL`,
    );

    // 4. Create performance indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_REVIEW_USERID" ON "reviews" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REVIEW_PRODUCT_CREATED" ON "reviews" ("productId", "createdAt") `,
    );

    // 5. Re-add foreign keys constraints
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop foreign keys constraints temporary
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );

    // 2. Drop performance indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_REVIEW_PRODUCT_CREATED"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_REVIEW_USERID"`);

    // 3. Revert foreign key columns to NULLABLE
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "productId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "userId" DROP NOT NULL`,
    );

    // 4. Safe revert column for comment (No data loss)
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "comment" TYPE character varying`,
    );

    // 5. Re-add foreign keys constraints
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
