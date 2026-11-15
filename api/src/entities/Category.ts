
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Transaction } from "./Transaction";
import { Budget } from "./Budget";

export type CategoryType = "income" | "expense";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("identity", {
    type: "bigint",
    generatedIdentity: "ALWAYS",
  })
  id!: string;

  @Column({ type: "varchar", unique: true })
  name!: string;

  @Column({ name: "category_type", type: "varchar" })
  category_type!: CategoryType;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions!: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets!: Budget[];
}
