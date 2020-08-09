import Router from "@koa/router";
import { signup } from "../controllers/users";

const routerOpts: Router.RouterOptions = {
    prefix: '/api',
};

const router = new Router(routerOpts);

router.post('/signup', signup);

export default router;



