exports.createTable = (client) => {
  return new Promise((resolve, reject) => {
    const query = `CREATE TABLE IF NOT EXISTS auth (
        email text,
        created timestamp,
        id uuid,
        password text,
        PRIMARY KEY ((email), created)
      ) WITH CLUSTERING ORDER BY (created DESC);`;
    const params = [];
    client.execute(query, params, { prepare: true }, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log('info Auth table initialized');
      resolve(client);
    });
  });
};