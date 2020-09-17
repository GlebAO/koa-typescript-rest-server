import Router from "@koa/router";
import {  createPost, deletePost, updatePost, postSchema, getAllPosts, managePost, getOwnPostBySlug } from "../controllers/posts";
import { DefaultState, Context } from 'koa';
import validator from "koa-yup-validator";

const routerOpts: Router.RouterOptions = {
    prefix: '/api',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/posts/own/:slug', getOwnPostBySlug);

router.post('/posts', validator(postSchema), createPost);

router.delete('/posts/:post_id', deletePost);

router.patch('/posts/:post_id', validator(postSchema), updatePost);

router.get('/backend/posts', getAllPosts);

router.patch('/backend/posts/:postId', managePost);

export default router;
