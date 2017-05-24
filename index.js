const request = require('request');

const errorMessages = {
  ELLIPSIS_OBJECT_MISSING: "You need to pass an `ellipsis` object through from an Ellipsis action",
  MESSAGE_MISSING: "You need to pass a `message` argument",
  ACTION_NAME_MISSING: "You need to pass an `actionName` argument",
  TRIGGER_AND_ACTION_NAME_MISSING: "You need to pass either an `actionName` or a `trigger` argument",
  BOTH_TRIGGER_AND_ACTION_NAME: "You can't pass both an `actionName` and a `trigger` argument. Just pass one",
  SCHEDULE_ACTION_MISSING: "You need to pass an `action` argument for the thing you want to schedule",
  UNSCHEDULE_ACTION_MISSING: "You need to pass an `action` argument for the thing you want to unschedule",
  RECURRENCE_MISSING: "You need to pass a `recurrence` argument to specify when you want to schedule the action to recur, e.g. \"every weekday at 9am\""
};

class ActionsApi {

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

  handleResponse(options, error, response, body) {
    if (error) {
      this.handleError(options, error);
    } else if (response.statusCode !== 200) {
      this.handleError(options, response.statusCode + ": " + response.body);
    } else if (options.success) {
      options.success(response, body);
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

module.exports = {
  ActionsApi: ActionsApi,
  ErrorMessages: errorMessages
};
