import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

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

    @Column("text")
    content!: string;

}