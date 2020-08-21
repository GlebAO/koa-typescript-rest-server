import Router from "@koa/router";
import { getActivePosts, getActivePostBySlug } from "../controllers/posts";
import { DefaultState, Context } from 'koa';

const routerOpts: Router.RouterOptions = {
    prefix: '/api/posts',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/', getActivePosts);

router.get('/:slug', getActivePostBySlug);

export default router;
