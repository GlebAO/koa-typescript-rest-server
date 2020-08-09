import 'reflect-metadata';
import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { Post, User } from "../models";

const connectionOpts: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'koa',
    password: process.env.DB_PASSWORD || 'koa',
    database: process.env.DB_NAME || 'blog',
    entities: [Post, User],
    synchronize: true,
};

const connection: Promise<Connection> = createConnection(connectionOpts);

export default connection;