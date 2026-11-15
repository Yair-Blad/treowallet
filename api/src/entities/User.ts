
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Account } from "./Account";
import { Transaction } from "./Transaction";
import { Budget } from "./Budget";
import { Beneficiary } from "./Beneficiary";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("identity", {
    type: "bigint",
    generatedIdentity: "ALWAYS",
  })
  id!: string;

  @Column({ name: "first_name", type: "varchar" })
  first_name!: string;

  @Column({ name: "last_name", type: "varchar" })
  last_name!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  phone!: string | null;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @Column({ name: "is_active", type: "boolean", default: true })
  is_active!: boolean;

  @Column({ name: "password_hash", type: "text", nullable: true })
  password_hash!: string | null;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets!: Budget[];

  @OneToMany(() => Beneficiary, (beneficiary) => beneficiary.user)
  beneficiaries!: Beneficiary[];
}
