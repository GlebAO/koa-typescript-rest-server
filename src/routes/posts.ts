import Router from "@koa/router";
import { getPosts, createPost, deletePost, updatePost, getPostBySlug } from "../controllers/posts";

const routerOpts: Router.RouterOptions = {
    prefix: '/api/posts',
};

const router = new Router(routerOpts);

router.get('/', getPosts);

router.get('/:slug', getPostBySlug);

router.post('/', createPost);

router.delete('/:post_id', deletePost);

router.patch('/:post_id', updatePost);

export default router;
