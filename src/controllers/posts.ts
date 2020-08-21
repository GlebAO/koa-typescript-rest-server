import Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import { Post, User, UserRole } from "../models";
import HttpStatus from 'http-status-codes';
import * as yup from "yup";
import { PostStatus } from "../models/Post";

export const postSchema = yup.object().shape({
    title: yup.string().required().min(2).max(150),
    slug: yup.string().required().min(2).max(150).matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/),
    content: yup.string().required().min(50)
});

export const getActivePosts = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const posts = await postRepo.find({ where: {status: PostStatus.ACTIVE }, order: { createdAt: "DESC" } });
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

export const getActivePostBySlug = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne({ slug: ctx.params.slug, status: PostStatus.ACTIVE });

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

    const userId = parseInt(ctx.user.sub);
    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Ошибка сохранения поста");
    }
    if (!canCreatePost(user)) {
        ctx.throw(HttpStatus.FORBIDDEN, "У Вас нет прав для создания записей. Обратитесь к администратору.");
    }

    const postByTitle = await postRepo.findOne({ title: title });
    if (postByTitle) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такое название поста уже занято");
    }

    const postBySlug = await postRepo.findOne({ slug: slug });
    if (postBySlug) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такая ссылка для поста уже занята");
    }

    const newPost: Post = postRepo.create({ title, slug, content });
    newPost.userId = <any>userId;

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
    const postId = parseInt(ctx.params.post_id);
    const userId = parseInt(ctx.user.sub);
    const { title, slug } = ctx.request.body;

    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne(postId);
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }

    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Ошибка сохранения поста");
    }
    if (!canUpdatePost(user, post)) {
        ctx.throw(HttpStatus.FORBIDDEN, "У Вас нет прав для редактирования этого поста");
    }

    if (post.title !== title) {
        const postByTitle = await postRepo.findOne({ title: title });
        if (postByTitle) {
            ctx.throw(HttpStatus.BAD_REQUEST, "Такое название поста уже занято");
        }
    }

    if (post.slug !== slug) {
        const postBySlug = await postRepo.findOne({ slug: slug });
        if (postBySlug) {
            ctx.throw(HttpStatus.BAD_REQUEST, "Такая ссылка для поста уже занята");
        }
    }

    await postRepo.update(
        { id: postId },
        { ...ctx.request.body, status: PostStatus.DRAFT },
    );
    const updatedPost = await postRepo.findOne(postId);
    ctx.body = {
        post: updatedPost
    };

}

const canUpdatePost = (user: User, post: Post) => {
    return (post.userId === user.id && user.role === UserRole.USER) || user.role === UserRole.ADMIN
}

const canCreatePost = (user: User) => {
    return user.role !== UserRole.GUEST
}