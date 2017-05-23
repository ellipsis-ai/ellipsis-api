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
const api = new EllipsisApi.ActionsApi(ellipsis);

describe("ActionsApi", () => {

  describe("run", () => {
    it("sends an appropriate api request", () => {

      expect.hasAssertions();
      const args = [ {name: "param", value: "v" }];
      return api.run("foo", { args: args }).then(data => {
        const form = data.body.form;
        expect(form.actionName).toEqual("foo");
        expect(form.responseContext).toEqual(ellipsis.userInfo.messageInfo.medium);
        expect(form.channel).toEqual(ellipsis.userInfo.messageInfo.channel);
        expect(form["arguments[0].name"]).toEqual(args[0].name);
        expect(form["arguments[0].value"]).toEqual(args[0].value);
      });

    });

  });

  describe("postMessage", () => {
    it("sends an appropriate api request", () => {

      expect.hasAssertions();
      return api.postMessage("foo bar baz").then(data => {
        const form = data.body.form;
        expect(form.message).toEqual("foo bar baz");
        expect(form.responseContext).toEqual(ellipsis.userInfo.messageInfo.medium);
        expect(form.channel).toEqual(ellipsis.userInfo.messageInfo.channel);
      });

    });

  });

});
