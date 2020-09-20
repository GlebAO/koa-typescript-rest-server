import Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import { Post, Tag, User, UserRole } from "../models";
import HttpStatus from 'http-status-codes';
import * as yup from "yup";
import { PostStatus } from "../models/Post";
import { filterPostsWithPagination, findOneBySlug, findOneById } from "../repository/PostsRepository";
import { transliterate as slugify } from 'transliteration';

export const postSchema = yup.object().shape({
    title: yup.string().required().min(2).max(150),
    slug: yup.string().required().min(2).max(150).matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/),
    content: yup.string().required().min(50),
    tags: yup.array().of(yup.string())
});

export const postListParamsSchema = yup.object().shape({
    page: yup.number().min(1),
    perPage: yup.number().min(1).max(100)
})

export const getActivePosts = async (ctx: Koa.Context): Promise<void> => {
    const { page, perPage, tag } = ctx.request.query;
    const posts = await filterPostsWithPagination(page, perPage, PostStatus.ACTIVE, tag)
    ctx.body = {
        posts
    };
}

export const getAuthorPosts = async (ctx: Koa.Context): Promise<void> => {
    const { page, perPage } = ctx.request.query;
    const userId = parseInt(ctx.user.sub);

    const posts = await filterPostsWithPagination(page, perPage, undefined, undefined, userId)
    ctx.body = {
        posts
    };
}

export const getAllPosts = async (ctx: Koa.Context): Promise<void> => {
    if (ctx.user.role !== UserRole.ADMIN) {
        ctx.throw(HttpStatus.FORBIDDEN, "Недостаточно прав");
    }
    const { page, perPage } = ctx.request.query;
    const posts = await filterPostsWithPagination(page, perPage)
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
    const post = await postRepo.findOne({ slug: ctx.params.slug }); //, status: PostStatus.ACTIVE

    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }

    if (post.status === PostStatus.PENDING) {
        ctx.throw(HttpStatus.FORBIDDEN, "Пост находится на модерации.");
    }

    ctx.body = {
        post
    };
}

//allow users to view own posts when they on moderation
export const getOwnPostBySlug = async (ctx: Koa.Context): Promise<void> => {
    const userId = parseInt(ctx.user.sub);

    //const postRepo: Repository<Post> = getRepository(Post);
    const post = await findOneBySlug(ctx.params.slug); //, status: PostStatus.ACTIVE

    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }

    if ( (post.status === PostStatus.PENDING || post.status === PostStatus.DRAFT) && post.userId !== userId) {
        ctx.throw(HttpStatus.FORBIDDEN, "Пост находится на модерации.");
    }

    ctx.body = {
        post
    };
}

interface PostDataInterface {
    title: string,
    content: string,
    slug: string,
    tags?: Tag[]
}

export const createPost = async (ctx: Koa.Context): Promise<void> => {
    const postRepo: Repository<Post> = getRepository(Post);
    const { title, content, slug, tags } = ctx.request.body;

    let postData: PostDataInterface = {
        title,
        content,
        slug: slug.toLowerCase(),
    }

    const userId = parseInt(ctx.user.sub);
    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Ошибка сохранения поста");
    }
    if (!canCreatePost(user)) {
        ctx.throw(HttpStatus.FORBIDDEN, "У Вас нет прав для создания записей. Обратитесь к администратору.");
    }

    const postByTitle = await postRepo.findOne({ title: postData.title });
    if (postByTitle) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такое название поста уже занято");
    }

    const postBySlug = await postRepo.findOne({ slug: postData.slug });
    if (postBySlug) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такая ссылка для поста уже занята");
    }

    const newPost: Post = postRepo.create(postData);
    newPost.userId = <any>userId;

    if (tags && tags.length > 0) {
        const uniqueTags = tags.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);
        const tagModels = [];
        for (let tag of uniqueTags) {
            tagModels.push(await checkTag(tag))
        }
        newPost.tags = tagModels;
    }

    newPost.status = PostStatus.PENDING

    const savedPost = await postRepo.save(newPost);
    const post = await findOneById(savedPost.id);

    ctx.body = {
        post: post
    };
}

const checkTag = async (tag: string) => {
    const tagRepo: Repository<Tag> = getRepository(Tag);
    const existingTag = await tagRepo.findOne({ title: tag });
    if (existingTag !== undefined) {
        existingTag.score = existingTag.score + 1
        return existingTag;
    } else {
        const tagModel = new Tag();
        tagModel.title = tag;
        tagModel.slug = slugify(tag)
        return tagModel;
    }
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

export const managePost = async (ctx: Koa.Context): Promise<void> => {
    const postId = parseInt(ctx.params.postId);
    const { status } = ctx.request.body

    if (ctx.user.role !== UserRole.ADMIN) {
        ctx.throw(HttpStatus.FORBIDDEN, "У Вас нет прав");
    }

    const postRepo: Repository<Post> = getRepository(Post);
    const post = await postRepo.findOne(postId);
    if (!post) {
        ctx.throw(HttpStatus.NOT_FOUND);
    }

    const statuses = [PostStatus.ACTIVE, PostStatus.PENDING ,PostStatus.DRAFT, PostStatus.ARCHIVED];

    if (status === undefined) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Нет обязательных параметров");
    }

    if (status && !statuses.includes(status)) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Такого статусу не существует");
    }

    await postRepo.update(
        { id: postId },
        { status },
    );

    const updatedPost = await postRepo.findOne(postId);
    ctx.body = {
        post: updatedPost
    };
}

export const updatePost = async (ctx: Koa.Context): Promise<void> => {
    const postId = parseInt(ctx.params.post_id);
    const userId = parseInt(ctx.user.sub);

    const { title, slug, content, tags } = ctx.request.body;

    const postData = {
        title,
        content,
        slug: slug.toLowerCase()
    }

    const postRepo: Repository<Post> = getRepository(Post);
    const post = await findOneById(postId);

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

    if (post.title !== postData.title) {
        const postByTitle = await postRepo.findOne({ title: postData.title });
        if (postByTitle) {
            ctx.throw(HttpStatus.BAD_REQUEST, "Такое название поста уже занято");
        }
    }

    if (post.slug !== postData.slug) {
        const postBySlug = await postRepo.findOne({ slug: postData.slug });
        if (postBySlug) {
            ctx.throw(HttpStatus.BAD_REQUEST, "Такая ссылка для поста уже занята");
        }
    }

    if (tags && tags.length === 0) {
        post.tags = []
    } else {
        let newTags = [];
        const uniqueTags = tags.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);
        for (let tag of uniqueTags) {
            const existingTag = post.tags.find(postTag => postTag.title === tag);
            if (existingTag) {
                newTags.push(existingTag)
            } else {
                newTags.push(await checkTag(tag));
            }
        }
        post.tags = newTags;
    }

    post.status = PostStatus.PENDING

    const updatedPost = await postRepo.save({ ...post, ...postData});

    ctx.body = {
        post: {...updatedPost, userId}
    };

}

const canUpdatePost = (user: User, post: Post) => {
    return (post.userId === user.id && user.role === UserRole.USER) || user.role === UserRole.ADMIN
}

const canCreatePost = (user: User) => {
    return user.role !== UserRole.GUEST
}