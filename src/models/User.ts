import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Timestamp } from "typeorm";
import Post from "./Post";

export enum UserRole {
  ADMIN = "admin",
  USER = "redactor",
  GUEST = "guest",
}

export enum UserStatus {
  ACTIVE = 10,
  INACTIVE = 9,
  DELETED = 0,
}

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 150,
    unique: true,
  })
  email!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  password!: string;

  @Column({
    type: "varchar",
    length: 10,
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role!: UserRole;

  @Column({
    type: "int",
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status!: UserStatus;

  @OneToMany(() => Post, post => post.user)
  posts!: Post[];

  @CreateDateColumn()
  createdAt!: Timestamp;

  @UpdateDateColumn()
  updatedAt!: Timestamp;

  @Column({
    type: "int",
    default: null,
  })
  lastLoggedIn!: number
}
