"use strict";

jest.mock('request');

const errorMessages = require('../error-messages');
const request = require('request');
const EllipsisApi = require('../index');
const ellipsis = {
  userInfo: {
    messageInfo: {
      medium: "slack",
      channel: "C123456"
    }
  },
  token: "123456acbdef"
};
const defaultExpectedForm = {
  responseContext: ellipsis.userInfo.messageInfo.medium,
  channel: ellipsis.userInfo.messageInfo.channel,
  token: ellipsis.token
};

const api = new EllipsisApi(ellipsis);
const actionsApi = api.actions;
const storageApi = api.storage;

describe("ActionsApi", () => {

  describe("run", () => {
    it("sends an appropriate api request for a name", () => {

      expect.hasAssertions();
      const args = [ {name: "param", value: "v" }];
      const actionName = "foo";
      return actionsApi.run({ actionName: actionName, args: args }).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          actionName: actionName,
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("run_action"));
      });

    });

    it("sends an appropriate api request for a trigger", () => {

      expect.hasAssertions();
      const trigger = "foo bar baz";
      return actionsApi.run({ trigger: trigger }).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          trigger: trigger
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("run_action"));
      });

    });

    it("complains if no trigger or actionName", () => {

      expect.hasAssertions();
      actionsApi.run({}).catch(err => {
        expect(err).toEqual(errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
      });

    });

    it("complains if both trigger and actionName", () => {

      expect.hasAssertions();
      actionsApi.run({ actionName: "foo", trigger: "bar" }).catch(err => {
        expect(err).toEqual(errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
      });

    });

  });

  describe("say", () => {

    it("sends an appropriate api request", () => {

      expect.hasAssertions();
      const message = "yo";
      return actionsApi.say({ message: message }).then(body => {
        const form = body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          message: message
        });
        expect(form).toEqual(expectedForm);
        expect(request.post.mock.calls[0][0].url).toEqual(actionsApi.urlFor("say"));
      });

    });

    it("complains when no message", () => {

      expect.hasAssertions();
      return actionsApi.say({ }).catch(err => {
        expect(err).toEqual(errorMessages.MESSAGE_MISSING);
      });

    });

  });

  describe("schedule", () => {

    const defaultOptions = {
      recurrence: "every day at noon",
      useDM: true
    };

    it("sends an appropriate api request", () => {

      expect.hasAssertions();
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

      expect.hasAssertions();
      return actionsApi.schedule(defaultOptions).catch(err => {
        expect(err).toEqual(errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
      });

    });

    it("complains when both trigger and action name", () => {

      expect.hasAssertions();
      const options = Object.assign({}, defaultOptions, {
        actionName: "foo",
        trigger: "bar"
      });
      return actionsApi.schedule(options).catch(err => {
        expect(err).toEqual(errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
      });

    });

    it("complains when no recurrence", () => {

      expect.hasAssertions();
      const options = Object.assign({}, defaultOptions, {
        actionName: "foo"
      });
      delete options.recurrence;
      return actionsApi.schedule(options).catch(err => {
        expect(err).toEqual(errorMessages.RECURRENCE_MISSING);
      });

    });

  });

  describe("unschedule", () => {

    it("sends an appropriate api request", () => {

      expect.hasAssertions();
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

      expect.hasAssertions();
      return actionsApi.unschedule({}).catch(err => {
        expect(err).toEqual(errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
      });

    });

    it("complains when both trigger and action name", () => {

      expect.hasAssertions();
      const options = Object.assign({}, {
        actionName: "foo",
        trigger: "bar"
      });
      return actionsApi.unschedule(options).catch(err => {
        expect(err).toEqual(errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
      });

    });

  });

});

describe("StorageApi", () => {

  describe("query", () => {
    it("sends an appropriate api request for a query", () => {

      expect.hasAssertions();
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

      expect.hasAssertions();
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

      expect.hasAssertions();
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

      expect.hasAssertions();
      storageApi.query({}).catch(err => {
        expect(err).toEqual(errorMessages.GRAPHQL_QUERY_MISSING);
      });

    });

  });

});
