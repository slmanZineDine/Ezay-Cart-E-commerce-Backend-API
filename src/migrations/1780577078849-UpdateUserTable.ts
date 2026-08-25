import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1780577078849 implements MigrationInterface {
  name = 'UpdateUserTable1780577078849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" TYPE character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" TYPE character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password" TYPE text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password" TYPE character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" TYPE character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" TYPE character varying
    `);
  }
}
