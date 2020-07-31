import app from './app';
import postgresConnection from './database/postgres.connection';

const PORT:number = Number(process.env.PORT) || 3005;

postgresConnection
  .then(() => app.listen(PORT))
  .catch(console.error);