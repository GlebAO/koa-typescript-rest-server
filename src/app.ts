import Koa from "koa";
import dotenv from "dotenv";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import jwt from "koa-jwt";
import HttpStatus from 'http-status-codes';
import jwtDecode from "jwt-decode";
import nodemailer from 'nodemailer';

import postRoutes from "./routes/posts";
import userRoutes from "./routes/users";
import tagRoutes from "./routes/tags";
import commentsRoutes from "./routes/comments";
import postProtectedRoutes from "./routes/postsProtected";
import userProtectedRoutes from "./routes/usersProtected";
import commentProtectedRoutes from "./routes/commentsProtected";
import tagProtectedRoutes from './routes/tagsProtected';
import sitemapRoutes from "./routes/sitemap";

import Mail from "nodemailer/lib/mailer";

dotenv.config();

const app: Koa = new Koa();

app.use(helmet());

if(process.env.NODE_ENV === 'dev') {
    app.use(cors());
}

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

app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {

    let mailConfig;
    if (process.env.NODE_ENV === 'prod') {
        mailConfig = {
            service: 'Yandex',
            auth: {
                user: process.env.YANDEX_LOGIN,
                pass: process.env.YANDEX_PASSWORD
            }
        }
    } else {
        mailConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'nasir.becker8@ethereal.email',
                pass: 'xpJJm2kHaj6NwUntnw'
            }
        };
    }
    let transporter = nodemailer.createTransport(mailConfig)

    const defaultOptions: Mail.Options = {
        from: process.env.YANDEX_LOGIN!
    }

    ctx.mailer = (data: Mail.Options, callback: (error: Error | null, info: any) => void) => transporter.sendMail({ ...defaultOptions, ...data }, (error, info) => callback(error, info));
    //ctx.mailer = transporter.sendMail(data, (error, info) => callback(error, info));
    await next()
})

app.use(postRoutes.routes()).use(postRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(commentsRoutes.routes()).use(commentsRoutes.allowedMethods());
app.use(tagRoutes.routes()).use(tagRoutes.allowedMethods());

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
        ctx.throw(HttpStatus.UNAUTHORIZED, "There was a problem authorizing the request");
    } else {
        ctx.user = decodedToken;
        await next();
    }
});

app.use(postProtectedRoutes.routes()).use(postProtectedRoutes.allowedMethods());
app.use(userProtectedRoutes.routes()).use(userProtectedRoutes.allowedMethods()); 
app.use(commentProtectedRoutes.routes()).use(commentProtectedRoutes.allowedMethods());
app.use(tagProtectedRoutes.routes()).use(tagProtectedRoutes.allowedMethods());
app.use(sitemapRoutes.routes()).use(sitemapRoutes.allowedMethods());

// Application error logging.
if(process.env.NODE_ENV === 'dev') {
    app.on('error', console.error);
}

export default app;
