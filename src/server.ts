import app from './app';
import dbConnection from './database/connection';
import https from 'https';
import fs from 'fs';

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/ecotermplus.ru-0003/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/ecotermplus.ru-0003/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/ecotermplus.ru-0003/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const PORT: number = Number(process.env.PORT) || 3005;
dbConnection
  .then(() => https.createServer(credentials, app.callback()).listen(PORT))
  .catch(console.error);



