import Router from "@koa/router";
import { getPosts, getPostBySlug } from "../controllers/posts";
import { DefaultState, Context } from 'koa';

const routerOpts: Router.RouterOptions = {
    prefix: '/api/posts',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/', getPosts);

router.get('/:slug', getPostBySlug);

export default router;
