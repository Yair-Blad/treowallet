
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransfers1794700800000 implements MigrationInterface {
  name = "CreateTransfers1794700800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Categoría utilizada para identificar las transferencias en el historial.
    await queryRunner.query(`
      INSERT INTO "categories" ("name", "category_type")
      VALUES ('Transferencias', 'expense')
      ON CONFLICT ("name")
      DO UPDATE SET "category_type" = EXCLUDED."category_type"
    `);

    await queryRunner.query(`
      CREATE TABLE "transfers" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "user_id" BIGINT NOT NULL,
        "beneficiary_id" BIGINT NOT NULL,
        "account_id" BIGINT NOT NULL,
        "amount" NUMERIC(14,2) NOT NULL,
        "idempotency_key" VARCHAR(100) NOT NULL,
        "transaction_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "CHK_transfers_amount"
          CHECK ("amount" > 0),

        CONSTRAINT "UQ_transfers_user_idempotency"
          UNIQUE ("user_id", "idempotency_key"),

        CONSTRAINT "UQ_transfers_transaction"
          UNIQUE ("transaction_id"),

        CONSTRAINT "FK_transfers_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_transfers_beneficiary"
          FOREIGN KEY ("beneficiary_id")
          REFERENCES "beneficiaries"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_transfers_account"
          FOREIGN KEY ("account_id")
          REFERENCES "accounts"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_transfers_transaction"
          FOREIGN KEY ("transaction_id")
          REFERENCES "transactions"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transfers_user_id"
      ON "transfers" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_transfers_user_id"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "transfers"
    `);

    // No eliminar la categoría si ya está siendo utilizada por transacciones.
    await queryRunner.query(`
      DELETE FROM "categories"
      WHERE "name" = 'Transferencias'
        AND NOT EXISTS (
          SELECT 1
          FROM "transactions"
          WHERE "transactions"."category_id" = "categories"."id"
        )
    `);
  }
}
