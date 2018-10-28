require('dotenv').config({
    path: 'variables.env'
});

const Promise = require('bluebird');
const cassandra = require('cassandra-driver');
const { withRetries } = require('./with-retries');

/**
 * Looks up the location of the cassandra service and creates a client with the options/keyspace 
 * specified. Returns a Promise of the created client.
 */
function createClientAsync(keyspace, queryOptions) {
  return new Promise ((resolve, reject) => {
      let contactPoints = process.env.CASSANDRA_CONTACT_POINTS.split(',');
      console.log('info Servers', contactPoints);
      return resolve(contactPoints);
     })
    .then(contactPoints => {
        const authProvider =  new cassandra.auth.PlainTextAuthProvider(process.env.CASSANDRA_USER, process.env.CASSANDRA_PASS) ; 
        let client = new cassandra.Client({ contactPoints, keyspace, queryOptions, authProvider: authProvider});
        client.connect(function (err) {
          if (err) {
            console.log('Error', err);
          }
        });
        Promise.promisifyAll(client); // This creates "Async" versions of methods that return promises
        return client;
    });
};

// A singleton client instance to be reused throughout the application
let clientInstance = null;

/**
 * Gets a Cassandra client instance.
 */
exports.getCassandraClient = () => {
  if (clientInstance === null) {
    throw new Error('No client instance found. Did you forget to call initCassandraAsync?');
  }

  return clientInstance;
};

/**
 * Initializes Cassandra by creating any keyspace and tables necessary, and making sure the
 * client can connect to the cluster. Should be called before using the getCassandraClient
 * method in this module. Returns a Promise.
 */
exports.initCassandraAsync = () => {
  console.log('info', 'Initializing cassandra');

  // Create the client with some default query options
  return createClientAsync(process.env.CASSANDRA_KEYSPACE, {
      prepare: true,
      consistency: cassandra.types.consistencies.quorum
    })
    .tap(client => {
      // Wait until Cassandra is ready and we can connect (could be delayed if starting up for 1st time)
      return withRetries(() => client.connectAsync(), 10, 10, 'Error connecting to cassandra', false);
    })
    .tap(client => {
      // Save client instance for reuse everywhere and log
      clientInstance = client;
      console.log('info', 'Cassandra initialized')
    });
};