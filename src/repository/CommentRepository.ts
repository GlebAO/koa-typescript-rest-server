import { getConnection } from "typeorm";
import Comment from "../models/Comment";

export async function filterCommentsWithPagination(commentableId: string | number | undefined, page: number = 0, perPage: number = 10): Promise<[Comment[], number]> {

    const query = getConnection()
        .createQueryBuilder()
        .from(Comment, "c")
        .addSelect('c')
        .leftJoin("c.author", "u")
        .addSelect('u.name')
        .addSelect('u.id as userId')
       //.andWhere("c.parentId = :parentId", {parentId: null})
        .take(perPage)
        .skip(page === 1 || page === 0 ? 0 : --page * perPage)
        .orderBy("c.createdAt", "DESC");

        if(commentableId) {
            query.andWhere("c.postId = :commentableId", { commentableId })
        }

    //console.log(query.getSql());

    return await query.getManyAndCount();
}

export async function findOneById(id: number) {
    return getConnection()
        .createQueryBuilder()
        .from(Comment, "c")
        .addSelect('c')
        .leftJoin("c.author", "u")
        .addSelect('u.name')
        .addSelect('u.id as userId')
        .andWhere("c.id = :id", { id })
        .getOne();
}
