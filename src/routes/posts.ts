import Router from "@koa/router";
import { getPosts, getPostById, createPost, deletePost, updatePost } from "../controllers/posts";

const routerOpts: Router.RouterOptions = {
    prefix: '/posts',
};

const router = new Router(routerOpts);

router.get('/', getPosts);

router.get('/:post_id', getPostById);

router.post('/', createPost);

router.delete('/:post_id', deletePost);

router.patch('/:post_id', updatePost);

export default router;
