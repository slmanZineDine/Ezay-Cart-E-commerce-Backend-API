import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnforceNonNegativePriceProductTable1781184382273 implements MigrationInterface {
  name = 'EnforceNonNegativePriceProductTable1781184382273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_4f89fdb25537b37409d3b781c8" CHECK ("price" >= 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "CHK_4f89fdb25537b37409d3b781c8"`,
    );
  }
}
