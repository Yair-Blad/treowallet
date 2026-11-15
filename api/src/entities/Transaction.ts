
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "./User";
import { Account } from "./Account";
import { Category } from "./Category";

export type TransactionType = "income" | "expense";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("identity", {
    type: "bigint",
    generatedIdentity: "ALWAYS",
  })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  user_id!: string;

  @Column({ name: "account_id", type: "bigint" })
  account_id!: string;

  @Column({ name: "category_id", type: "bigint" })
  category_id!: string;

  @Column({ type: "varchar" })
  description!: string;

  @Column({ name: "transaction_type", type: "varchar" })
  transaction_type!: TransactionType;

  @Column({ type: "numeric" })
  amount!: string;

  @Column({
    name: "transaction_date",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  transaction_date!: Date;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "account_id" })
  account!: Account;

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: "category_id" })
  category!: Category;
}
