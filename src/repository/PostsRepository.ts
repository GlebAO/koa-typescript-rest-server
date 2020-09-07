import { getConnection } from "typeorm";
import Post, { PostStatus } from "../models/Post";

export async function filterPostsWithPagination(page: number = 0, perPage: number = 10, status?: PostStatus): Promise<[Post[], number]> {

    const query = getConnection()
        .createQueryBuilder()
        .select(["p", "u.name"])
        .from(Post, "p")
        .leftJoin("p.user", "u")
        .take(perPage)
        .skip(page === 1 || page === 0 ? 0 : --page * perPage)
        .groupBy("p.id, u.id")
        .orderBy("p.createdAt", "DESC");

    if (status) {
        query.andWhere("p.status = :status", { status })
    }

    console.log(query.getSql());

    return await query.getManyAndCount();
}
