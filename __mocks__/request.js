"use strict";

module.exports = {

  post: function (options, callback) {
    const body = options;
    const response = {
      statusCode: 200,
      body: body // just echo back the options for inspection by tests
    };
    callback(null, response, body);
  }

};
