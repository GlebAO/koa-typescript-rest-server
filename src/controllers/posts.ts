import Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import { Post } from "../models";
import HttpStatus from 'http-status-codes';

export const getPosts = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const posts = await postRepo.find();
    ctx.body = {
        data: { posts },
    };
}

export const getPostById = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne(ctx.params.post_id);
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }
    ctx.body = {
        data: { post },
    };
}

export const createPost = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const { id, title, content } = ctx.request.body;
    const post: Post = postRepo.create({ id, title, content });
    await postRepo.save(post);
    ctx.body = {
        data: { post },
    };
}

export const deletePost = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne(ctx.params.post_id);
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }
    await postRepo.delete(post.id);
    ctx.status = HttpStatus.NO_CONTENT;
}

export const updatePost = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne(ctx.params.post_id);
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }
    await postRepo.update(
        { id: ctx.params.post_id },
        ctx.request.body,
    );
    const updatedPost = await postRepo.findOne(ctx.params.post_id);
    ctx.body = {
        data: { post: updatedPost },
    };

}