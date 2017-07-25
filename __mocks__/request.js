"use strict";

module.exports = {

  post: jest.fn((options, callback) => {
    const body = options;
    const response = {
      statusCode: 200,
      url: options.url,
      body: body // just echo back the options for inspection by tests
    };
    callback(null, response, body);
  })

};
