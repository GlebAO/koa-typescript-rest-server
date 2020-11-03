import Router from "@koa/router";
import { Context, DefaultState } from "koa";
import { create } from "../controllers/sitemap";

const routerOpts: Router.RouterOptions = {
    prefix: '/api/sitemap',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/', create);

export default router;