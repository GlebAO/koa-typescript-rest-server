import { EntityRepository, AbstractRepository } from "typeorm";
import Post, { PostStatus } from "../models/Post";

@EntityRepository(Post)
export class PostsRepository extends AbstractRepository<Post> {
    filterPostsWithPagination(page: number = 0, perPage: number = 10, status?: PostStatus): Promise<[Post[], number]> {
        const whereConditions = {};
        if (status) {
            Object.assign(whereConditions, { status })
        }

        return this.repository.findAndCount({
            where: whereConditions,
            order: { createdAt: "DESC" },
            take: perPage,
            skip: page === 1 || page === 0 ? 0 : --page * perPage
            //cache: true
        })
    }

}