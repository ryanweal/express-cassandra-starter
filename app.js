const {
  initCassandraAsync
} = require('./src/cassandra.js');
const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');


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
    // Start the express server to process requests
    .then(() => {
      const app = express();
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({
        extended: true
      }));
      // security by obscurity
      app.disable('x-powered-by');
      // @todo routes go here
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