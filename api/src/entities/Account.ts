
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

import { User } from "./User";
import { Transaction } from "./Transaction";

export type AccountType = "wallet" | "debit" | "savings" | "credit";

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn("identity", {
    type: "bigint",
    generatedIdentity: "ALWAYS",
  })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  user_id!: string;

  @Column({ name: "account_name", type: "varchar" })
  account_name!: string;

  @Column({ name: "account_type", type: "varchar" })
  account_type!: AccountType;

  @Column({ type: "char", length: 3, default: "MXN" })
  currency!: string;

  @Column({
    name: "opening_balance",
    type: "numeric",
    default: 0,
  })
  opening_balance!: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions!: Transaction[];
}
