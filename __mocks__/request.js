"use strict";

module.exports = {

  post: jest.fn((options, callback) => {
    const body = options;
    const response = {
      statusCode: options.form.token ? 200 : 400,
      statusMessage: options.form.token ? "Ok" : "Bad request",
      url: options.url,
      body: require('util').inspect(body) // just echo back the options for inspection by tests
    };
    callback(null, response, body);
  })

};
