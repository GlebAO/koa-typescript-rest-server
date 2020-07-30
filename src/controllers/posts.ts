import Koa from 'koa';
//import { Post } from "../models/post";

export const getPosts = async (ctx: Koa.Context): Promise<void> => {
    ctx.body = "print posts!";
}