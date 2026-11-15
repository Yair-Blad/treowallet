import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from "typeorm";

import { User } from "./User";

@Entity("beneficiaries")
@Unique("UQ_beneficiarie_user_clabe", ["user_id", "clabe"])
export class Beneficiary {
    @PrimaryGeneratedColumn("identity", {
        type: "bigint",
        generatedIdentity: "ALWAYS",
    })
    id!: string;

    @Column({ name: "user_id", type:"bigint"})
    user_id!: string;

    @Column({ name: "beneficiary_name", type: "varchar" })
    beneficiary_name!: string;

    @Column({ type: "varchar" })
    alias!: string;

    @Column({ type: "char", length: 18 })
    clabe!: string;

    @Column({
        name: "created_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    created_at!: Date;

    @ManyToOne(() => User, (user) => user.beneficiaries, {
        onDelete: "CASCADE",
    })
    @JoinColumn({name: "user_id"})
    user!: User;
}

