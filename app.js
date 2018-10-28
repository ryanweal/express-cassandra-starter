const {
  initCassandraAsync
} = require('./src/cassandra.js');
const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const helmet = require('helmet');
const nodeLimits = require('limits');

const reqDuration = 2629746000; // 1-month hsts

const auth = require('./controllers/auth.js');

// Allow bluebird promise cancellation
Promise.config({
  cancellation: true
});

/**
 * Connect to Cassandra and start Express
 */
function startAsync() {
  // Start by initializing cassandra
  return initCassandraAsync()
    // Create any tables here
    .then(client => {
      return auth.createTable(client);
    })
    // Start the express server to process requests
    .then(() => {
      const app = express();
      app.use(bodyParser.json({
        limit: '1mb' // limit string length
      }));
      app.use(bodyParser.urlencoded({
        extended: true
      }));

      // security by obscurity (helmet does this also)
      app.disable('x-powered-by');

      // helmet
      app.use(helmet());

      // hsts
      app.use(helmet.hsts({
        maxAge: reqDuration
      }));

      // framebuster
      app.use(helmet.frameguard({
        action: 'deny'
      }));

      // content security policy
      app.use(helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          childSrc: ["'none'"],
          objectSrc: ["'none'"],
          formAction: ["'none'"],
        }
      }));

      // x-xss-protection (disabled for ie8/ie9 which opens vulnerability)
      app.use(helmet.xssFilter());

      // x-content-type-options
      app.use(helmet.noSniff());

      // limit some things
      app.use(nodeLimits({
        file_uploads: false,
        post_max_size: 1000000,   // 1mb max upload
        inc_req_timeout: 1000*60  // 60 seconds 
      }))

      const port = 3003;

      app.get('/', (req, res) => res.send('Hello World!'))

      app.listen(port, () => console.log(`info Express listening on port ${port}!`))

      return app;
    })
    .catch(err => {
      // Use console to log error since logger might write asynchronously
      console.error(err);
      process.exit(1);
    });
}

let startPromise = startAsync();


/**
 * Handle stopping everything. From Datastax example.
 */
function stop() {
  console.log('info', 'Attempting to shutdown');
  if (startPromise.isFulfilled()) {
    let server = startPromise.value();
    return new Promise((resolve, reject) => {
      resolve(server.removeAllListeners());
    })
    .then(() => process.exit(0));
  } else {
    startPromise.cancel();
    process.exit(0);
  }
}

// Try to gracefully shutdown on SIGTERM and SIGINT
process.on('SIGTERM', stop);
process.on('SIGINT', stop);

// Graceful shutdown attempt in Windows
if (process.platform === 'win32') {
  // Simulate SIGINT on Windows (see http://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js)
  createInterface({
      input: process.stdin,
      output: process.stdout
    })
    .on('SIGINT', () => process.emit('SIGINT'));
}