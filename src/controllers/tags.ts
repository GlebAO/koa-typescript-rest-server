import Koa from 'koa';
import { getCustomRepository } from "typeorm";
import { getRepository, Repository } from 'typeorm';
import { TagsRepository } from "../repository/TagsRepository";
import HttpStatus from 'http-status-codes';
import { Tag } from '../models';
import * as yup from "yup";

export const tagSchema = yup.object().shape({
  title: yup.string().required().min(2).max(150),
  slug: yup.string().required().min(2).max(150).matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/),
  score: yup.number()
});

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

export const updateTag = async (ctx: Koa.Context): Promise<void> => {
  const tagRepo: Repository<Tag> = getRepository(Tag);
  const tagId = parseInt(ctx.params.tag);
  const tagModel = ctx.request.body;

  const tag = await tagRepo.findOne({id: tagId});

  if (!tag) {
      ctx.throw(HttpStatus.NOT_FOUND);
  }

  const updatedTag = await tagRepo.save({ ...tag, ...tagModel });

  ctx.body = {
    tag: updatedTag
  };
}