import Router from "@koa/router";
import { tagSchema, updateTag } from "../controllers/tags";
import { DefaultState, Context } from 'koa';
import validator from "koa-yup-validator";

const routerOpts: Router.RouterOptions = {
    prefix: '/api/tags',
};

const router = new Router<DefaultState, Context>(routerOpts);

router.patch('/:tag', validator(tagSchema), updateTag);

export default router;