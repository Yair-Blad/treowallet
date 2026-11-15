
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBeneficiaries1794528000000
  implements MigrationInterface
{
  name = "CreateBeneficiaries1794528000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "beneficiaries" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "user_id" BIGINT NOT NULL,
        "beneficiary_name" VARCHAR NOT NULL,
        "alias" VARCHAR NOT NULL,
        "clabe" CHAR(18) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "FK_beneficiaries_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "UQ_beneficiaries_user_clabe"
          UNIQUE ("user_id", "clabe"),

        CONSTRAINT "CHK_beneficiaries_clabe_format"
          CHECK ("clabe" ~ '^[0-9]{18}$')
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_beneficiaries_user_id"
      ON "beneficiaries" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_beneficiaries_user_id"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "beneficiaries"
    `);
  }
}
