# REST API service with Koajs and TypeScript

> A repository containing a Node.js REST API service in TypeScript using KOA.  

## Installation

- Clone this repository and run commands below. You can use `tsc -w` command for compile TypeScript to JavaScript on a fly for dev purposes. 

```shell
$ npm install
$ tsc
$ npm start
```
- Create PostgreSQL database.

```shell
$ sudo adduser koa
$ sudo su postgres
$ psql
$ CREATE DATABASE blog;
$ CREATE USER koa WITH ENCRYPTED PASSWORD 'koa';
$ GRANT ALL PRIVILEGES ON DATABASE blog TO koa;
$ \q
$ exit
```