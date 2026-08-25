import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImagesTable1781183671441 implements MigrationInterface {
    name = 'AddProductImagesTable1781183671441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_images" ("id" SERIAL NOT NULL, "url" text NOT NULL, "altText" character varying(255), "productId" integer NOT NULL, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_PRODUCTS_IMAGES_PRODUCTID" ON "product_images" ("productId") `);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_PRODUCTS_IMAGES_PRODUCTID"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
    }

}
