import Router from "@koa/router";
import { signup, login, emailConfirm } from "../controllers/users";
import { DefaultState, Context } from 'koa';

const routerOpts: Router.RouterOptions = {
    prefix: '/api',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.post('/signup', signup);

router.post('/login', login);

router.get('/signup/confirm', emailConfirm);

export default router;



