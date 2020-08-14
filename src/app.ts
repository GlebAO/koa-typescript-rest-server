import Koa from "koa";
import dotenv from "dotenv";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import jwt from "koa-jwt";
import HttpStatus from 'http-status-codes';
import jwtDecode from "jwt-decode";


import postRoutes from "./routes/posts";
import userRoutes from "./routes/users";
import postProtectedRoutes from "./routes/postsProtected";

dotenv.config();

const app: Koa = new Koa();

app.use(helmet());
app.use(cors());
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

app.use(postRoutes.routes()).use(postRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(jwt({ 
    secret: process.env.JWT_SECRET!,
    issuer: "api.gsweb.ru",
    audience: "api.gsweb.ru",
    cookie: 'token'
}));
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
    const token = ctx.cookies.get('token');

    if (!token) {
        ctx.throw(HttpStatus.FORBIDDEN, "Authentication invalid.");
      }

    const decodedToken = jwtDecode(token);

    if (!decodedToken) {
        ctx.throw(HttpStatus.UNAUTHORIZED, "There was a proble authorizing the request");
    } else {
      ctx.user = decodedToken;
      await next();
    }
});
app.use(postProtectedRoutes.routes()).use(postProtectedRoutes.allowedMethods());

// Application error logging.
app.on('error', console.error);

export default app;
