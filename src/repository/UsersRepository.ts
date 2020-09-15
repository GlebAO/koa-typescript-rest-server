import User from "../models/User";
import { EntityRepository, AbstractRepository } from "typeorm";

@EntityRepository(User)
export class UsersRepository extends AbstractRepository<User> {
    filterPostsWithPagination(page: number = 0, perPage: number = 10): Promise<[User[], number]> {

        return this.repository.findAndCount({
            order: { createdAt: "DESC" },
            take: perPage,
            skip: page === 1 || page === 0 ? 0 : --page * perPage
            //cache: true
        })
    }
}