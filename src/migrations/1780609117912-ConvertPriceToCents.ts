import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPriceToCents1780609117912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "products" 
      SET "price" = "price" * 100
    `);

    await queryRunner.query(`
      ALTER TABLE "products" 
      ALTER COLUMN "price" TYPE INTEGER USING "price"::INTEGER
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" 
      ALTER COLUMN "price" TYPE DECIMAL(10,2) USING "price"::DECIMAL
    `);

    await queryRunner.query(`
      UPDATE "products" 
      SET "price" = "price" / 100
    `);
  }
}
