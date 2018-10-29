# express-cassandra-starter

This is an express.js based webservice starter kit for services connecting to Apache Cassandra™ and/or DataStax Enterprise using the official `datastax-driver`. This package also includes security-related packages and an example `auth` table and associated endpoint example.

This is not an official package. It was created by Ryan Weal of Kafei Interactive Inc. (Montréal). Some of the startup code was copied from the `killrvideo-nodejs` as noted below. As a result, this work is licensed similarly as Apache-2.0.

## Install Steps

0. Clone this repo

    Run `npm install` to fetch the packages needed to run this package. Install Node.js if you do not have npm.

1. Populate your environment variables and/or create a variables.env file in this folder:

```
CASSANDRA_USER='username'
CASSANDRA_PASS='password'
CASSANDRA_CONTACT_POINTS="127.0.0.3,127.0.0.4,127.0.0.5"
CASSANDRA_KEYSPACE='mykeyspace'
SECRET='randomwords' # changing this will expire all issued tokens
```

2. Remember to create a keyspace, `mykeyspace`, to start:

    create keyspace mykeyspace with replication = { 'class' : 'SimpleStrategy', 'replication_factor' : 2 } ;

3. Then run `npm run start`.


## Colophon

This package makes use of:

 - bcrypt (for auth example)
 - bluebird
 - dotenv (sets environment variables locally, not needed in production if you are being very strict)
 - datastax-driver
 - express.js
 - helmet
 - jsonwebtoken (for auth example)
 - limits
 - node.js
 - validator.js

Some code examples (to establish connections with Cassandra) were copied or derived from: https://github.com/KillrVideo/killrvideo-nodejs (also license Apache-2.0). Specifically: src/with-retries.js is used unchanged from the original. I modified src/cassandra.js to enable starting the application in a way I think makes the most sense for serverless startup. Support for the logger and etcd was completely dropped for now. Additionally app.js was used as a starting point, maintaining the same `startAsync` and `stop` functions in structure but otherwise mapping out to express-related functions at the appropriate times.



## License

Copyright 2018, Ryan Weal

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
