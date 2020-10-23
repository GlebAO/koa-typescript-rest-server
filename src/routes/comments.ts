import Router from "@koa/router";
import {  getComments } from "../controllers/comments";
import { DefaultState, Context } from 'koa';

const routerOpts: Router.RouterOptions = {
    prefix: '/api/comments',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/', getComments);

export default router;