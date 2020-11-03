import Tag from "../models/Tag";
import { EntityRepository, AbstractRepository } from "typeorm";

@EntityRepository(Tag)
export class TagsRepository extends AbstractRepository<Tag> {

    filterTagsWithPagination(page: number = 0, perPage: number = 10): Promise<[Tag[], number]> {
        return this.repository.findAndCount({
            order: { score: "DESC" },
            take: perPage,
            skip: page === 1 || page === 0 ? 0 : --page * perPage
            //cache: true
        })
    }

    getAllTags() {
        return this.repository.find({
            order: { score: "DESC" }
        })
    }

}