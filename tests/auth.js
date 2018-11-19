'use strict';

const expect = require('chai').expect;
const request = require('request');
const simple_pass = 'zLZSk6v9-' + Math.floor(Math.random() * Math.floor(10241024));

describe('express-cassandra-starter', function () {

  describe('auth', function () {

    it('post /testcleanup to clear any previous run', function (done) {
      request({
        uri: 'http://localhost:3003/testcleanup',
        method: 'POST',
        json: {}
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('get /login should be 404', function (done) {
      request.get('http://localhost:3003/login', function (err, res, body) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('post /register with valid info', function (done) {
      request({
        uri: 'http://localhost:3003/register',
        method: 'POST',
        json: {
          email: 'test@example.com',
          password: simple_pass,
        }
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });


    it('post /register with invalid info (short password) fails', function (done) {
      request({
        uri: 'http://localhost:3003/register',
        method: 'POST',
        json: {
          email: 'test2@example.com',
          password: '123456',
        }
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(403);
        done();
      });
    });

    it('post /register with invalid info (long password) fails', function (done) {
      request({
        uri: 'http://localhost:3003/register',
        method: 'POST',
        json: {
          email: 'test2@example.com',
          password: 'DxfjnFgPqoiZpklLGhyKU61OUwb9TcRkqH3qA9r3vJMXmnkCmXHgc4WaRkd33TRZnY1CkeBvB06IFBFoi0nZQVOlc2fuFSKdT62GDxfjnFgPqoiZpklLGhyKU61OUwb9TcRkqH3qA9r3vJMXmnkCmXHgc4WaRkd33TRZnY1CkeBvB06IFBFoi0nZQVOlc2fuFSKdT62G',
        }
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(403);
        done();
      });
    });

    it('post /login with valid info passes', function (done) {
      request({
        uri: 'http://localhost:3003/login',
        method: 'POST',
        json: {
          email: 'test@example.com',
          password: simple_pass,
        }
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('post /testcleanup to clear the account away', function (done) {
      request({
        uri: 'http://localhost:3003/testcleanup',
        method: 'POST',
        json: {}
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('post /login with valid info for closed account fails', function (done) {
      request({
        uri: 'http://localhost:3003/login',
        method: 'POST',
        json: {
          email: 'test@example.com',
          password: simple_pass,
        }
      }, function (err, res, body) {
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

  });
});