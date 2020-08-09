import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp } from "typeorm";
import User from "./User";

@Entity()
export default class Post {
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

  @Column("text")
  content!: string;

  @ManyToOne(type => User, user => user.posts)
  user!: User;

  @CreateDateColumn()
  createdAt!: Timestamp;

  @UpdateDateColumn()
  updatedAt!: Timestamp;
}
