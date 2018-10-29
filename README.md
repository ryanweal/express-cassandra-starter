# express-cassandra-starter

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

 - express.js
 - helmet
 - limits
 - dotenv
 - datastax-driver
 - node.js

Some code examples (to establish connections with Cassandra) were copied or derived from: https://github.com/KillrVideo/killrvideo-nodejs (also license Apache-2.0).



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
