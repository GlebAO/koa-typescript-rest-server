import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import Post from "./Post";

@Entity()
export default class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 150,
        unique: true,
    })
    title!: string;

    @Column({
        type: "varchar",
        length: 150,
        unique: true,
    })
    slug!: string;

    @Column({
        type: "int",
        default: 0
    })
    score!: number;

    @ManyToMany(() => Post, posts => posts.tags)
    posts!: Post[];
}
