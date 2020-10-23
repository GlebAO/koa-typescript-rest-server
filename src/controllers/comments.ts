import Koa from 'koa';
import { getRepository, Repository, getManager } from 'typeorm';
import { Comment, User, UserRole } from '../models';
import * as yup from "yup";
import HttpStatus from 'http-status-codes';
import { filterCommentsWithPagination, findOneById } from '../repository/CommentRepository';

export const commentSchema = yup.object().shape({
    content: yup.string().required().min(2).max(250),
    parentId: yup.number()
});

export const getComments = async (ctx: Koa.Context): Promise<void> => {
    const { commentableId, page, perPage} = ctx.request.query;

   // const manager = getManager();
   // const trees = await manager.getTreeRepository(Comment).findTrees();
   // console.log(trees);

    const comments = await filterCommentsWithPagination(commentableId, page, perPage)

    ctx.body = {
        comments
    }
}

export const createCommentOld = async (ctx: Koa.Context): Promise<void> => {
    const commentRepo: Repository<Comment> = getRepository(Comment);

    const { content, parentId } = ctx.request.body;
    const postId = parseInt(ctx.params.postId);
    const userId = parseInt(ctx.user.sub);

    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Ошибка сохранения комментария");
    }

    let commentData = {
        content,
        parentId,
        postId,
        userId
    }

    const savedComment = await commentRepo.save(commentData);
    const comment = await findOneById(savedComment.id);

    ctx.body = {
        comment: comment
    };
}

export const getAllComments = async (ctx: Koa.Context): Promise<void> => {
    if (ctx.user.role !== UserRole.ADMIN) {
        ctx.throw(HttpStatus.FORBIDDEN, "Недостаточно прав");
    }
    const { page, perPage } = ctx.request.query;
    const comments = await filterCommentsWithPagination(undefined, page, perPage)

    ctx.body = {
        comments
    };
}

export const deleteComment = async (ctx: Koa.Context): Promise<void> => {
    const commentId = parseInt(ctx.params.commentId);
    const comment = await findOneById(commentId);

    if(!comment) {
        ctx.throw(HttpStatus.NOT_FOUND, "Комментария не существует");
    }
    if (ctx.user.sub !== comment.userId && ctx.user.role !== UserRole.ADMIN ) {
        ctx.throw(HttpStatus.FORBIDDEN, "Недостаточно прав");
    }
    const commentRepo: Repository<Comment> = getRepository(Comment);
    const deleted = await commentRepo.delete(comment.id);

    ctx.body = {
        deleted
    };
}

export const createComment = async (ctx: Koa.Context): Promise<void> => {
    const manager = getManager();
    const commentRepo: Repository<Comment> = getRepository(Comment);
    const { content, parentId } = ctx.request.body;
    const postId = parseInt(ctx.params.postId);
    const userId = parseInt(ctx.user.sub);

    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ id: userId });
    if (!user) {
        ctx.throw(HttpStatus.BAD_REQUEST, "Ошибка сохранения комментария");
    }

    const newComment = new Comment();
    newComment.postId = postId;
    newComment.userId = userId;
    newComment.content = content;

    if(parentId) {
        const parent = await commentRepo.findOne({ id: parentId })
        if( parent ) {
            newComment.parent = parent
        }
    }

    const savedComment = await manager.save(newComment);
    const comment = await findOneById(savedComment.id);

    ctx.body = {
        comment: comment
    };
}

export const updateComment = async (ctx: Koa.Context): Promise<void> => {
    const commentId = parseInt(ctx.params.commentId);
    const userId = parseInt(ctx.user.sub);
    const {content} = ctx.request.body;

    const comment = await findOneById(commentId);
    const commentRepo: Repository<Comment> = getRepository(Comment);

    if(!comment) {
        ctx.throw(HttpStatus.NOT_FOUND, "Комментарий не найден");
    }
    comment.content = content;

    if(userId !== comment.userId) {
        ctx.throw(HttpStatus.FORBIDDEN, "Комментарий не принадлежит автору");
    }

    const updatedComment = await commentRepo.save(comment);
    updatedComment.userId = userId;

    ctx.body = {
        comment: updatedComment
    };
}