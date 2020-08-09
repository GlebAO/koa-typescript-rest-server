import Koa from "koa";
import dotenv from "dotenv";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import HttpStatus from 'http-status-codes';

import postRoutes from "./routes/posts";
import userRoutes from "./routes/users";

dotenv.config();

const app: Koa = new Koa();

// Provides important security headers to make your app more secure
app.use(helmet());

// Enable cors with default options
app.use(cors());

// Enable bodyParser with default options
app.use(bodyParser());

// Generic error handling middleware.
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
        await next();
    } catch (error) {
        ctx.status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        error.status = ctx.status;
        ctx.body = { error };
        ctx.app.emit('error', error, ctx);
    }
});

// Route middleware.
app.use(postRoutes.routes()).use(postRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());

// Application error logging.
app.on('error', console.error);

export default app;
