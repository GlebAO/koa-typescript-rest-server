import Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import { Post, User } from "../models";
import HttpStatus from 'http-status-codes';
import * as yup from "yup";

export const postSchema = yup.object().shape({
    title: yup.string().required().min(2).max(150),
    slug: yup.string().required().min(2).max(150).matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/),
    content: yup.string().required().min(50)
});

export const getPosts = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const posts = await postRepo.find({order:{createdAt: "DESC"}});
    ctx.body = {
        posts
    };
}

export const getPostById = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne(ctx.params.post_id);
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }
    ctx.body = {
        post
    };
}

export const getPostBySlug = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne({ slug: ctx.params.slug });
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }
    ctx.body = {
        post
    };
}

export const createPost = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const { title, content, slug } = ctx.request.body;

    const postByTitle = await postRepo.findOne({ title: title });
    if (postByTitle) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такое название поста уже занято");
    }
    const postBySlug = await postRepo.findOne({ slug: slug });

    if (postBySlug) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такая ссылка для поста уже занята");
    }

    const userId = ctx.user.sub;
    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Ошибка сохранения поста");
    }

    const newPost: Post = postRepo.create({ title, slug, content });
    newPost.user = <any>userId;

    const savedPost = await postRepo.save(newPost);

    ctx.body = {
        savedPost
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
        post: updatedPost
    };

}