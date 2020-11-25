# REST API service with Koajs and TypeScript

> A repository containing a Node.js REST API service in TypeScript using KOA.  

## Installation

- Clone this repository and run commands below. You can use `tsc -w` command for compile TypeScript to JavaScript on a fly for dev purposes. 
n
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

## License

Copyright (c) 2020, Gleb Averyanov All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

    Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.