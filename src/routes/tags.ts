import Router from "@koa/router";
import { getTags, getTagBySlug } from "../controllers/tags";
import { DefaultState, Context } from 'koa';

const routerOpts: Router.RouterOptions = {
    prefix: '/api/tags',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/', getTags);

router.get('/:slug', getTagBySlug);

export default router;