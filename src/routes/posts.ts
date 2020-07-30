import Koa from "koa";
import Router from "@koa/router";
import { getPosts } from "../controllers/posts";

const routerOpts: Router.RouterOptions = {
    prefix: '/posts',
};

const router = new Router(routerOpts);

router.get('/', getPosts);

router.get('/:post_id', async (ctx: Koa.Context) => {
    ctx.body = 'GET SINGLE';
});

router.post('/', async (ctx: Koa.Context) => {
    ctx.body = 'POST';
});

router.delete('/:post_id', async (ctx: Koa.Context) => {
    ctx.body = 'DELETE';
});

router.patch('/:post_id', async (ctx: Koa.Context) => {
    ctx.body = 'PATCH';
});

export default router;
