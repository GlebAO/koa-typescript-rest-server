import Router from "@koa/router";
import { getActivePosts, getActivePostBySlug, postListParamsSchema } from "../controllers/posts";
import { DefaultState, Context } from 'koa';
import validator from "koa-yup-validator";

const routerOpts: Router.RouterOptions = {
    prefix: '/api/posts',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/', validator(postListParamsSchema), getActivePosts);

router.get('/:slug', getActivePostBySlug);

export default router;
