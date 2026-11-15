
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "./User";
import { Category } from "./Category";

@Entity("budgets")
export class Budget {
  @PrimaryGeneratedColumn("identity", {
    type: "bigint",
    generatedIdentity: "ALWAYS",
  })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  user_id!: string;

  @Column({ name: "category_id", type: "bigint" })
  category_id!: string;

  @Column({ type: "numeric" })
  amount!: string;

  @Column({ name: "budget_month", type: "date" })
  budget_month!: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.budgets, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Category, (category) => category.budgets)
  @JoinColumn({ name: "category_id" })
  category!: Category;
}
