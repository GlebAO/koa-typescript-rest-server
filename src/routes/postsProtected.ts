import Router from "@koa/router";
import {  createPost, deletePost, updatePost, postSchema } from "../controllers/posts";
import { DefaultState, Context } from 'koa';
import validator from "koa-yup-validator";

const routerOpts: Router.RouterOptions = {
    prefix: '/api/posts',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.post('/', validator(postSchema), createPost);

router.delete('/:post_id', deletePost);

router.patch('/:post_id', validator(postSchema), updatePost);

export default router;
