import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, JoinColumn } from "typeorm";
import User from "./User";

export enum PostStatus {
  ACTIVE = 10,
  DRAFT = 9,
  ARCHIVED = 0,
}

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

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Timestamp;

  @UpdateDateColumn()
  updatedAt!: Timestamp;

  @Column({
    type: "int",
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;
}
