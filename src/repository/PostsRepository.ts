import { getConnection } from "typeorm";
import Post, { PostStatus } from "../models/Post";

export async function findOneById(id: number) {
    return getConnection()
        .createQueryBuilder()
        .from(Post, "p")
        .addSelect('p')
        .leftJoin("p.user", "u")
        .addSelect('u.name')
        .addSelect('u.id as userId')
        .leftJoinAndSelect("p.tags", "t")
        .andWhere("p.id = :id", { id })
        .getOne();
}

export async function findOneBySlug(slug: string) {
    return getConnection()
        .createQueryBuilder()
        .from(Post, "p")
        .addSelect('p')
        .leftJoin("p.user", "u")
        .leftJoinAndSelect("p.tags", "t")
        .addSelect('u.name')
        .addSelect('u.id as userId')
        .andWhere("p.slug = :slug", { slug })
        .getOne();
}

export async function filterPostsWithPagination(page: number = 0, perPage: number = 10, status?: PostStatus, tag?: string, userId?: number): Promise<[Post[], number]> {

    const query = getConnection()
        .createQueryBuilder()
        .from(Post, "p")
        .leftJoin("p.user", "u")
        .leftJoinAndSelect("p.tags", "t")
        .addSelect('p')
        .addSelect('p.title, p.id, p.createdAt')
        .addSelect('u.name')
        .addSelect('u.id as userId')
        .take(perPage)
        .skip(page === 1 || page === 0 ? 0 : --page * perPage)
        .orderBy("p.createdAt", "DESC");

    if (status) {
        query.andWhere("p.status = :status", { status })
    }

    if( tag ) {
        query.andWhere("t.slug = :tag", { tag })
    }

    if(userId) {
        query.andWhere("p.userId = :userId", { userId })
    }

    //console.log(query.getSql());

    return await query.getManyAndCount();
}
