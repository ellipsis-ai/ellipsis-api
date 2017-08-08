const request = require('request');
const errorMessages = require('./error-messages');

class AbstractApi {

  constructor(ellipsis) {
    if (typeof ellipsis !== "object") {
      this.handleError({}, errorMessages.ELLIPSIS_OBJECT_MISSING);
    } else {
      this.ellipsis = ellipsis;
    }
  }

  channelFor(options) {
    return options.channel ? options.channel : this.ellipsis.userInfo.messageInfo.channel;
  }

  responseContextFor(options) {
    return options.responseContext ? options.responseContext : this.ellipsis.userInfo.messageInfo.medium;
  }

  token() {
    return this.ellipsis.token;
  }

  handleError(options, message) {
    if (options && options.error) {
      options.error(message);
    } else if (this.ellipsis && this.ellipsis.error) {
      this.ellipsis.error(message);
    } else {
      throw message;
    }
  }

}

class ActionsApi extends AbstractApi {

  handleResponse(options, error, response, body) {
    if (error) {
      this.handleError(options, error);
    } else if (response.statusCode !== 200) {
      this.handleError(options, response.statusCode + ": " + response.body);
    } else if (options.success) {
      options.success(body);
    } else {
      // do nothing if no success argument was provided
    }
  }

  argsFormDataFor(args) {
    if (args) {
      let data = {};
      args.forEach((ea, i) => {
        data[`arguments[${i}].name`] = ea.name;
        data[`arguments[${i}].value`] = ea.value;
      });
      return data;
    } else {
      return {};
    }
  }

  urlFor(path) {
    return `${this.ellipsis.apiBaseUrl}/api/${path}`;
  }

  checkActionOptionsIn(options) {
    if (!options.actionName && !options.trigger) {
      this.handleError(options, errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
    } else if (options.actionName && options.trigger) {
      this.handleError(options, errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
    }
  }

  run(options) {
    return new Promise((resolve, reject) => {
      const mergedOptions = Object.assign({}, options, {
        success: resolve,
        error: reject
      });
      this.checkActionOptionsIn(mergedOptions);
      const formData = Object.assign({
        actionName: mergedOptions.actionName,
        trigger: mergedOptions.trigger,
        responseContext: this.responseContextFor(mergedOptions),
        channel: this.channelFor(mergedOptions),
        token: this.token()
      }, this.argsFormDataFor(mergedOptions.args));
      request.post({
        url: this.urlFor("run_action"),
        form: formData
      }, (error, response, body) => this.handleResponse(mergedOptions, error, response, body));
    });
  }

  say(options) {
    return new Promise((resolve, reject) => {
      const mergedOptions = Object.assign({}, options, {
        success: resolve,
        error: reject
      });
      if (!mergedOptions.message) {
        this.handleError(mergedOptions, errorMessages.MESSAGE_MISSING);
      } else {
        request.post({
          url: this.urlFor("say"),
          form: {
            message: mergedOptions.message,
            responseContext: this.responseContextFor(mergedOptions),
            channel: this.channelFor(mergedOptions),
            token: this.token()
          }
        }, (error, response, body) => this.handleResponse(mergedOptions, error, response, body));
      }
    });
  }

  checkSchedulingOptionsIn(options) {
    this.checkActionOptionsIn(options);
    if (!options.recurrence) {
      this.handleError(options, errorMessages.RECURRENCE_MISSING);
    }
  }

  schedule(options) {
    return new Promise((resolve, reject) => {
      const mergedOptions = Object.assign({}, options, {
        success: resolve,
        error: reject
      });
      this.checkSchedulingOptionsIn(mergedOptions);
      const formData = Object.assign({
        actionName: mergedOptions.actionName,
        trigger: mergedOptions.trigger,
        responseContext: this.responseContextFor(mergedOptions),
        channel: this.channelFor(mergedOptions),
        recurrence: mergedOptions.recurrence,
        useDM: !!mergedOptions.useDM,
        token: this.token()
      }, this.argsFormDataFor(mergedOptions.args));
      request.post({
        url: this.urlFor("schedule_action"),
        form: formData
      }, (error, response, body) => this.handleResponse(mergedOptions, error, response, body));
    });
  }

  unschedule(options) {
    return new Promise((resolve, reject) => {
      const mergedOptions = Object.assign({}, options, {
        success: resolve,
        error: reject
      });
      this.checkActionOptionsIn(mergedOptions);
      const formData = {
        actionName: mergedOptions.actionName,
        userId: mergedOptions.userId,
        channel: this.channelFor(mergedOptions),
        responseContext: this.responseContextFor(mergedOptions),
        token: this.token()
      };
      request.post({
        url: this.urlFor("unschedule_action"),
        form: formData
      }, (error, response, body) => this.handleResponse(mergedOptions, error, response, body));
    });
  }

}

class StorageApi extends AbstractApi {

  url() {
    return `${this.ellipsis.apiBaseUrl}/api/graphql`;
  }

  checkOptionsIn(options) {
    if (!options.query) {
      this.handleError(options, errorMessages.GRAPHQL_QUERY_MISSING);
    }
  }

  variablesStringFor(v) {
    if (typeof v === 'object') {
      return JSON.stringify(v);
    } else if (v && typeof v.toString === 'function') {
      return v.toString();
    } else {
      return v;
    }
  }

  query(options) {
    return new Promise((resolve, reject) => {
      this.checkOptionsIn(options);
      const formData = {
        query: options.query,
        operationName: options.operationName,
        variables: this.variablesStringFor(options.variables),
        token: this.token()
      };
      request.post({
        url: this.url(),
        form: formData,
        json: true
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(`Error ${response.statusCode}: ${response.body}`);
        } else {
          resolve(body);
        }
      });
    });
  }

}

class Api extends AbstractApi {

  constructor(ellipsis) {
    super(ellipsis);
    this.actions = new ActionsApi(ellipsis);
    this.storage = new StorageApi(ellipsis);
  }

}

module.exports = Api;
