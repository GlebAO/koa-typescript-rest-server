import Router from "@koa/router";
import {  getUsers, updateUser } from "../controllers/users";
import { DefaultState, Context } from 'koa';

const routerOpts: Router.RouterOptions = {
    prefix: '/api/users',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.get('/',  getUsers );

router.patch('/:userId', updateUser);

export default router;