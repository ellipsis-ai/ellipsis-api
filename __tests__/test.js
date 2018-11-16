"use strict";

jest.mock('request');

const errorMessages = require('../error-messages');
const request = require('request');
const EllipsisApi = require('../index');
const EllipsisApiError = require('../ellipsis-api-error');
let ellipsis, defaultExpectedForm, expectedFormWithEventType, api, actionsApi, storageApi;

describe("ActionsApi", () => {
  beforeEach(() => {
    ellipsis = {
      userInfo: {
        messageInfo: {
          medium: "slack",
          channel: "C123456"
        }
      },
      event: {
        originalEventType: "chat"
      },
      token: "123456acbdef"
    };
    defaultExpectedForm = {
      responseContext: ellipsis.userInfo.messageInfo.medium,
      channel: ellipsis.userInfo.messageInfo.channel,
      token: ellipsis.token
    };
    expectedFormWithEventType = Object.assign({}, defaultExpectedForm, {
      originalEventType: ellipsis.event.originalEventType
    });
    api = new EllipsisApi(ellipsis);
    actionsApi = api.actions;
    storageApi = api.storage;
  });
  describe("run", () => {
    it("sends an appropriate api request for a name", () => {

      expect.assertions(2);
      const args = [ {name: "param", value: "v" }];
      const actionName = "foo";
      return actionsApi.run({ actionName: actionName, args: args }).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, expectedFormWithEventType, {
          actionName: actionName,
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("run_action"));
      });

    });

    it("sends an appropriate api request for a trigger", () => {

      expect.assertions(2);
      const trigger = "foo bar baz";
      return actionsApi.run({ trigger: trigger }).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, expectedFormWithEventType, {
          trigger: trigger
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("run_action"));
      });

    });

    it("complains if no trigger or actionName", () => {

      expect.assertions(1);
      expect(actionsApi.run({})).rejects.toHaveProperty('message', errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);

    });

    it("complains if both trigger and actionName", () => {

      expect.hasAssertions();
      expect(actionsApi.run({ actionName: "foo", trigger: "bar" })).rejects.toHaveProperty('message', errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);

    });

    it("throws an EllipsisApiError if a bad status code is received", () => {
      expect.assertions(1);
      api.ellipsis.token = null;
      const trigger = "foo bar baz";
      return actionsApi.run({ trigger: trigger }).catch(err => {
        expect(err instanceof EllipsisApiError).toBe(true);
      });
    });
  });

  describe("say", () => {

    it("sends an appropriate api request", () => {

      expect.assertions(2);
      const message = "yo";
      return actionsApi.say({ message: message }).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, expectedFormWithEventType, {
          message: message
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("say"));
      });

    });

    it("complains when no message", () => {

      expect.assertions(1);
      expect(actionsApi.say({ })).rejects.toHaveProperty('message', errorMessages.MESSAGE_MISSING);

    });

  });

  describe("schedule", () => {

    const defaultOptions = {
      recurrence: "every day at noon",
      useDM: true
    };

    it("sends an appropriate api request", () => {

      expect.assertions(2);
      const actionName = "some action";
      const args = [ {name: "param", value: "v" }];
      const options = Object.assign({}, defaultOptions, {
        actionName: actionName,
        args: args
      });
      return actionsApi.schedule(options).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, defaultOptions, {
          actionName: options.actionName,
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("schedule_action"));
      });

    });

    it("complains when no trigger or action name", () => {

      expect.assertions(1);
      expect(actionsApi.schedule(defaultOptions)).rejects.toHaveProperty('message', errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);

    });

    it("complains when both trigger and action name", () => {

      expect.assertions(1);
      const options = Object.assign({}, defaultOptions, {
        actionName: "foo",
        trigger: "bar"
      });
      expect(actionsApi.schedule(options)).rejects.toHaveProperty('message', errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);

    });

    it("complains when no recurrence", () => {

      expect.assertions(1);
      const options = Object.assign({}, defaultOptions, {
        actionName: "foo"
      });
      delete options.recurrence;
      expect(actionsApi.schedule(options)).rejects.toHaveProperty('message', errorMessages.RECURRENCE_MISSING);

    });

  });

  describe("unschedule", () => {

    it("sends an appropriate api request", () => {

      expect.assertions(2);
      const actionName = "some action";
      const options = Object.assign({}, {
        actionName: actionName
      });
      return actionsApi.unschedule(options).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          actionName: options.actionName
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("unschedule_action"));
      });

    });

    it("complains when no trigger or action name", () => {

      expect.assertions(1);
      expect(actionsApi.unschedule({})).rejects.toHaveProperty('message', errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);

    });

    it("complains when both trigger and action name", () => {

      expect.assertions(1);
      const options = Object.assign({}, {
        actionName: "foo",
        trigger: "bar"
      });
      expect(actionsApi.unschedule(options)).rejects.toHaveProperty('message', errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);

    });

  });

  describe("listen", () => {

    const actionName = "some action";
    const args = [ {name: "param", value: "v" }];
    const defaultOptions = {
      actionName: actionName
    };

    it("listens in default context", () => {

      defaultExpectedForm = {
        medium: api.ellipsis.userInfo.messageInfo.medium,
        channel: api.ellipsis.userInfo.messageInfo.channel,
        token: api.ellipsis.token,
        userId: api.ellipsis.userInfo.ellipsisUserId
      };

      expect.assertions(2);
      const options = Object.assign({}, { args: args }, defaultOptions);
      return actionsApi.listen(options).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, defaultOptions, {
          actionName: options.actionName,
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("v1/add_message_listener"));
      });

    });

    it("complains when no actionName", () => {

      expect.assertions(1);
      delete defaultOptions.actionName;
      expect(actionsApi.listen(defaultOptions)).rejects.toHaveProperty('message', errorMessages.ACTION_NAME_MISSING);

    });

  });

  describe("generateToken", () => {

    it("sends an appropriate api request", () => {

      expect.assertions(2);
      const expirySeconds = 300;
      const isOneTime = true;
      const options = Object.assign({}, {
        expirySeconds: expirySeconds,
        isOneTime: isOneTime
      });
      return actionsApi.generateToken(options).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, { token: ellipsis.token }, {
          expirySeconds: options.expirySeconds,
          isOneTime: options.isOneTime
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("v1/tokens"));
      });

    });

  });

  describe("deleteSavedAnswers", () => {
    it("sends a delete user saved answer request by default with an inputName", () => {
      return actionsApi.deleteSavedAnswers({
        inputName: "inputThatSavesAnswers"
      }).then(body => {
        expect(request.delete.mock.calls[0][0].url).toEqual(actionsApi.urlFor(`v1/inputs/inputThatSavesAnswers/user_saved_answer/${ellipsis.token}`));
      });
    });

    it('complains when inputName is missing', () => {
      expect(actionsApi.deleteSavedAnswers({})).rejects.toHaveProperty('message', errorMessages.INPUT_NAME_MISSING);
    });

    it('sends a delete team saved answers request with an inputName and deleteAll', () => {
      return actionsApi.deleteSavedAnswers({
        inputName: "inputThatSavesAnswers",
        deleteAll: true
      }).then(body => {
        expect(request.delete.mock.calls[0][0].url).toEqual(actionsApi.urlFor(`v1/inputs/inputThatSavesAnswers/team_saved_answers/${ellipsis.token}`));
      });
    });
  });


});

describe("StorageApi", () => {

  describe("query", () => {
    it("sends an appropriate api request for a query", () => {

      expect.assertions(2);
      const query = "{ foo { bar } }";
      return storageApi.query({ query: query }).then(body => {
        const form = body.form;
        const expectedForm = {
          query: query,
          operationName: undefined,
          variables: undefined,
          token: ellipsis.token
        };
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(storageApi.url());
      });

    });

    it("handles variables passed in a JS object", () => {

      expect.assertions(2);
      const query = "{ foo { bar } }";
      const variables = { key1: "something", key2: { key3: "something else" } };
      return storageApi.query({ query: query, variables: variables }).then(body => {
        const form = body.form;
        const expectedForm = {
          query: query,
          operationName: undefined,
          variables: JSON.stringify(variables),
          token: ellipsis.token
        };
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(storageApi.url());
      });

    });

    it("handles variables passed in a string", () => {

      expect.assertions(2);
      const query = "{ foo { bar } }";
      const variables = '{ "key1": "something", "key2": { "key3": "something else" } }';
      return storageApi.query({ query: query, variables: variables }).then(body => {
        const form = body.form;
        const expectedForm = {
          query: query,
          operationName: undefined,
          variables: variables,
          token: ellipsis.token
        };
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(storageApi.url());
      });

    });

    it("complains if no query", () => {

      expect.assertions(1);
      expect(storageApi.query()).rejects.toHaveProperty('message', errorMessages.GRAPHQL_QUERY_MISSING);

    });

  });

});

describe("legacy API methods", () => {
  it("works to call say from the api root", () => {
    expect.hasAssertions();

    return api.say({ message: "yo" }).then(() => {
      expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("say"));
    });
  });

  it("works to call run from the api root", () => {
    expect.hasAssertions();

    return api.run({ trigger: "yo" }).then(() => {
      expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("run_action"));
    });
  });

  it("works to call schedule from the api root", () => {
    expect.hasAssertions();

    return api.schedule({ trigger: "yo", recurrence: "every day at noon" }).then(() => {
      expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("schedule_action"));
    });
  });

  it("works to call unschedule from the api root", () => {
    expect.hasAssertions();

    return api.unschedule({ trigger: "yo" }).then(() => {
      expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("unschedule_action"));
    });
  });
});
