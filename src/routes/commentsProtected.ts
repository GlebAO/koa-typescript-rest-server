import Router from "@koa/router";
import {  commentSchema, createComment, deleteComment, getAllComments, updateComment } from "../controllers/comments";
import { DefaultState, Context } from 'koa';
import validator from "koa-yup-validator";

const routerOpts: Router.RouterOptions = {
    prefix: '/api',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.post('/comments/:postId', validator(commentSchema), createComment);

router.patch('/comments/:commentId', updateComment);

router.get('/comments/all', getAllComments);

router.delete('/comments/:commentId', deleteComment);

export default router;
