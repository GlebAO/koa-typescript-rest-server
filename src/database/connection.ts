import 'reflect-metadata';
import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { Post, User, Tag, Comment } from "../models";

const connectionOpts: ConnectionOptions = {
    type: process.env.NODE_ENV === 'prod' ? 'mysql' : 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'koa',
    password: process.env.DB_PASSWORD || 'koa',
    database: process.env.DB_NAME || 'blog',
    entities: [Post, User, Tag, Comment],
    synchronize: true,
    //logging: true
};

const connection: Promise<Connection> = createConnection(connectionOpts);

export default connection;