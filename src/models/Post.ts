import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, JoinColumn, JoinTable, ManyToMany } from "typeorm";
import User from "./User";
import Tag from "./Tag";

export enum PostStatus {
  ACTIVE = 10,
  PENDING = 9,
  DRAFT = 8,
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

  @ManyToMany(() => Tag, tags => tags.posts, {
    cascade: true,
    eager: true
  })
  @JoinTable()
  tags!: Tag[];


}
