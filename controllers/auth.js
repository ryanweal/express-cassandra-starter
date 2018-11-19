'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Uuid = require('cassandra-driver').types.Uuid;
let client = null;

exports.createTable = (init_client) => {
  client = init_client;
  return new Promise((resolve, reject) => {
    client.execute(`CREATE TABLE IF NOT EXISTS auth (
      email text,
      created timestamp,
      id uuid,
      password text,
      PRIMARY KEY (email)
    );`, [], {
      prepare: true
    }, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log('info Auth table initialized');
      resolve(client);
    });
  });
};

exports.register = async (req, res) => {
  // password
  if (!req.body.password || req.body.password.length === 0) {
    res.status(403).send('Please submit a password!');
    return;
  }
  if (!validator.isLength(req.body.password, {
      min: 8,
      max: 128
    })) {
    res.status(403).send('Please submit a password that is between 8 and 128 characters in length.');
    return;
  }
  // converted to safe value, hashed, and salted
  const pass = await bcrypt.hashSync(String(req.body.password), 8);

  // email
  if (!req.body.email || req.body.email.length === 0) {
    res.status(403).send('Please submit an email address!');
    return;
  }
  if (!validator.isLength(req.body.email, {
      min: 8,
      max: 128
    })) {
    res.status(403).send('That did not look like an email address.');
    return;
  }
  if (!validator.isEmail(req.body.email)) {
    res.status(403).send('Please, submit a REAL email address!');
    return;
  }
  const email = validator.normalizeEmail(String(req.body.email));

  // submit values to server
  client.execute(`INSERT INTO auth (email, created, id, password) VALUES (?, ?, ?, ?) IF NOT EXISTS`, [email, new Date(), Uuid.random(), pass], {
    prepare: true
  })
  .then(result => {
      const item = result.first();
      if (item['[applied]'] === false) {
        res.status(403).send('User already exists!');
        console.log('User already exists, did not update');
        return;
      }
      res.status(200).json({
        status: 'Success'
      });
  });
};

exports.login = async (req, res) => {
  // password
  if (!req.body.password || req.body.password.length === 0) {
    res.status(403).send({
      error: 'Please submit a password!'
    });
    return;
  }
  if (!validator.isLength(req.body.password, {
      min: 8,
      max: 128
    })) {
    res.status(403).send('Please submit a password that is between 8 and 128 characters in length.');
    return;
  }
  // converted to safe value, hashed, and salted
  const pass = String(req.body.password);

  // email
  if (!req.body.email || req.body.email.length === 0) {
    res.status(403).send('Please submit an email address!');
    return;
  }
  if (!validator.isLength(req.body.email, {
      min: 8,
      max: 128
    })) {
    res.status(403).send('That did not look like an email address.');
    return;
  }
  if (!validator.isEmail(req.body.email)) {
    res.status(403).send('Please, submit a REAL email address!');
    return;
  }
  const email = validator.normalizeEmail(String(req.body.email));

  // submit values to server
  client.execute(`SELECT password FROM auth WHERE email = ?`, [email], {
      prepare: true
    })
    .then(result => {
      if (result.rowLength === 0) {
        res.status(401).send('Login error');
        console.log('info Could not find ', email);
        return;
      }
      const item = result.first();

      let passwordIsValid = bcrypt.compareSync(pass, item.password);
      if (!passwordIsValid) {
        console.log('info Wrong password for', email);
        res.status(401).send('Please use the correct password!');
        return;
      } else {
        let token = jwt.sign({
          id: item.id,
          email: item.email
        }, process.env.SECRET, {
          expiresIn: 86400
        }); // expires in 24 hours

        console.log('info Issued token for ', email);
        res.status(200).json({
          token: token,
        });
      }
    });

};

exports.testcleanup = async (req, res) => {
  client.execute(`DELETE FROM auth WHERE email = ?`, ['test@example.com'], {
      prepare: true
    })
    .then(result => {
      console.log('info Test cleanup task has run')
      res.status(200).json({});
    });
};