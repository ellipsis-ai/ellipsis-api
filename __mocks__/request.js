"use strict";
const inspect = require('util').inspect;

module.exports = {

  post: jest.fn((options, callback) => {
    const body = options;
    const response = {
      statusCode: options.form.token ? 200 : 400,
      statusMessage: options.form.token ? "Ok" : "Bad request",
      url: options.url,
      body: inspect(body) // just echo back the options for inspection by tests
    };
    callback(null, response, body);
  }),

  delete: jest.fn((options, callback) => {
    const body = options;
    const response = {
      statusCode: 200,
      statusMessage: "Ok",
      url: options.url,
      body: inspect(body)
    };
    callback(null, response, body);
  })

};
