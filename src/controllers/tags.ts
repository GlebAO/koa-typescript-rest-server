import Koa from 'koa';
import { getCustomRepository } from "typeorm";
import { getRepository, Repository } from 'typeorm';
import { TagsRepository } from "../repository/TagsRepository";
import HttpStatus from 'http-status-codes';
import { Tag } from '../models';

export const getTags = async (ctx: Koa.Context): Promise<void> => {
    const { page, perPage } = ctx.request.query;
  const tagsRepository = getCustomRepository(TagsRepository);
  const tags = await tagsRepository.filterTagsWithPagination(page, perPage);

  ctx.body = {
    tags
  };
}

export const getTagBySlug = async (ctx: Koa.Context): Promise<void> => {
    const tagRepo: Repository<Tag> = getRepository(Tag);
    const tag = await tagRepo.findOne({ slug: ctx.params.slug }); //, status: PostStatus.ACTIVE

    if (!tag) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }

    ctx.body = {
        tag
    };
}