"use strict";

jest.unmock('../index');
jest.unmock('../error-messages');
jest.mock('request');

const errorMessages = require('../error-messages');
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

describe("ActionsApi", () => {

  describe("run", () => {
    it("sends an appropriate api request for a name", () => {

      expect.hasAssertions();
      const args = [ {name: "param", value: "v" }];
      const actionName = "foo";
      return api.run({ actionName: actionName, args: args }).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          actionName: actionName,
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
        expect(data.url).toEqual(api.urlFor("run_action"));
      });

    });

    it("sends an appropriate api request for a trigger", () => {

      expect.hasAssertions();
      const trigger = "foo bar baz";
      return api.run({ trigger: trigger }).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          trigger: trigger
        });
        expect(form).toEqual(expectedForm);
        expect(data.url).toEqual(api.urlFor("run_action"));
      });

    });

    it("complains if no trigger or actionName", () => {

      expect.hasAssertions();
      api.run({}).catch(err => {
        expect(err).toEqual(errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
      });

    });

    it("complains if both trigger and actionName", () => {

      expect.hasAssertions();
      api.run({ actionName: "foo", trigger: "bar" }).catch(err => {
        expect(err).toEqual(errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
      });

    });

  });

  describe("say", () => {

    it("sends an appropriate api request", () => {

      expect.hasAssertions();
      const message = "yo";
      return api.say({ message: message }).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          message: message
        });
        expect(form).toEqual(expectedForm);
        expect(data.url).toEqual(api.urlFor("say"));
      });

    });

    it("complains when no message", () => {

      expect.hasAssertions();
      return api.say({ }).catch(err => {
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
      return api.schedule(options).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, defaultOptions, {
          actionName: options.actionName,
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
        expect(data.url).toEqual(api.urlFor("schedule_action"));
      });

    });

    it("complains when no trigger or action name", () => {

      expect.hasAssertions();
      return api.schedule(defaultOptions).catch(err => {
        expect(err).toEqual(errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
      });

    });

    it("complains when both trigger and action name", () => {

      expect.hasAssertions();
      const options = Object.assign({}, defaultOptions, {
        actionName: "foo",
        trigger: "bar"
      });
      return api.schedule(options).catch(err => {
        expect(err).toEqual(errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
      });

    });

    it("complains when no recurrence", () => {

      expect.hasAssertions();
      const options = Object.assign({}, defaultOptions, {
        actionName: "foo"
      });
      delete options.recurrence;
      return api.schedule(options).catch(err => {
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
      return api.unschedule(options).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          actionName: options.actionName
        });
        expect(form).toEqual(expectedForm);
        expect(data.url).toEqual(api.urlFor("unschedule_action"));
      });

    });

    it("complains when no trigger or action name", () => {

      expect.hasAssertions();
      return api.unschedule({}).catch(err => {
        expect(err).toEqual(errorMessages.TRIGGER_AND_ACTION_NAME_MISSING);
      });

    });

    it("complains when both trigger and action name", () => {

      expect.hasAssertions();
      const options = Object.assign({}, {
        actionName: "foo",
        trigger: "bar"
      });
      return api.unschedule(options).catch(err => {
        expect(err).toEqual(errorMessages.BOTH_TRIGGER_AND_ACTION_NAME);
      });

    });

  });

});
