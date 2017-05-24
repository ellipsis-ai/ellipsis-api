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

describe("ActionsApi", () => {

  describe("run", () => {
    it("sends an appropriate api request", () => {

      expect.hasAssertions();
      const args = [ {name: "param", value: "v" }];
      return api.run("foo", { args: args }).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          actionName: "foo",
          "arguments[0].name": args[0].name,
          "arguments[0].value": args[0].value
        });
        expect(form).toEqual(expectedForm);
      });

    });

  });

  describe("postMessage", () => {
    it("sends an appropriate api request", () => {

      expect.hasAssertions();
      const message = "foo bar baz";
      return api.postMessage(message).then(data => {
        const form = data.body.form;
        const expectedForm = Object.assign({}, defaultExpectedForm, {
          message: message
        });
        expect(form).toEqual(expectedForm);
      });

    });

  });

});
