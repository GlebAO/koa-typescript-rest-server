import { Entity, Tree, TreeChildren, TreeParent, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Timestamp } from "typeorm";
import { Post, User } from ".";

export enum EntityTypes {
    POST = 'post'
}

@Entity()
@Tree("nested-set")
export default class Comment {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    content!: string;

    //////

    //@Column({ nullable: true })
    //parentId!: number;

    //@ManyToOne(() => Comment, comment => comment.children)
    //@JoinColumn({ name: 'parentId' })
    //parent!: Comment;

    //@OneToMany(() => Comment, comment => comment.parent)
    //children!: Comment[];

    @TreeChildren()
    children!: Comment[];

    @TreeParent()
    parent!: Comment;

    /////

    @ManyToOne(() => User, author => author.posts)
    @JoinColumn({ name: 'userId' })
    author!: User;

    @Column({ nullable: true })
    userId!: number;

    //////

    @ManyToOne(() => Post, posts => posts.comments )
    @JoinColumn({ name: 'postId' })
    post!: Post;

    @Column({ nullable: true })
    postId!: number;

    //////

    @CreateDateColumn()
    createdAt!: Timestamp;

    @UpdateDateColumn()
    updatedAt!: Timestamp;

}