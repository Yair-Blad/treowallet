
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";

import { User } from "./User";
import { Beneficiary } from "./Beneficiary";
import { Account } from "./Account";
import { Transaction } from "./Transaction";

@Entity("transfers")
export class Transfer {
  @PrimaryGeneratedColumn("identity", {
    type: "bigint",
    generatedIdentity: "ALWAYS",
  })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  user_id!: string;

  @Column({ name: "beneficiary_id", type: "bigint" })
  beneficiary_id!: string;

  @Column({ name: "account_id", type: "bigint" })
  account_id!: string;

  @Column({ type: "numeric", precision: 14, scale: 2 })
  amount!: string;

  @Column({ name: "idempotency_key", type: "varchar", length: 100 })
  idempotency_key!: string;

  @Column({ name: "transaction_id", type: "bigint", unique: true })
  transaction_id!: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Beneficiary, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "beneficiary_id" })
  beneficiary!: Beneficiary;

  @ManyToOne(() => Account, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "account_id" })
  account!: Account;

  @OneToOne(() => Transaction, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "transaction_id" })
  transaction!: Transaction;
}
