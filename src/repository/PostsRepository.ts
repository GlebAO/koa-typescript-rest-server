import { getConnection } from "typeorm";
import Post, { PostStatus } from "../models/Post";

export async function filterPostsWithPagination(page: number = 0, perPage: number = 10, status?: PostStatus): Promise<[Post[], number]> {

    const query = getConnection()
        .createQueryBuilder()
        .from(Post, "p")
        .leftJoin("p.user", "u")
        .leftJoinAndSelect("p.tags", "t")
        .addSelect('p')
        .addSelect('u.name')
        .take(perPage)
        .skip(page === 1 || page === 0 ? 0 : --page * perPage)
        .orderBy("p.createdAt", "DESC");

    if (status) {
        query.andWhere("p.status = :status", { status })
    }

    //console.log(query.getSql());

    return await query.getManyAndCount();
}
