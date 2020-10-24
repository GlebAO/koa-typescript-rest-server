import app from './app';
import dbConnection from './database/connection';
import http from 'http';

const PORT: number = Number(process.env.PORT) || 3005;
dbConnection
  .then(() => http.createServer(app.callback()).listen(PORT))
  .catch(console.error);



