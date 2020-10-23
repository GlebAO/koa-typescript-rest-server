import app from './app';
import dbConnection from './database/connection';


const PORT: number = Number(process.env.PORT) || 3005;
dbConnection
  .then(() => app.listen(PORT))
  .catch(console.error);



