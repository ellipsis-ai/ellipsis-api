"use strict";

jest.unmock('../index');
jest.mock('request');

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
}
const api = new EllipsisApi.ActionsApi(ellipsis);
const errorMessages = EllipsisApi.ErrorMessages;

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

});
