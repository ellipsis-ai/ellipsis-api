module.exports = {
  ELLIPSIS_OBJECT_MISSING: "You need to pass an `ellipsis` object through from an Ellipsis action",
  MESSAGE_MISSING: "You need to pass a `message` argument",
  ACTION_NAME_MISSING: "You need to pass an `actionName` argument",
  TRIGGER_AND_ACTION_NAME_MISSING: "You need to pass either an `actionName` or a `trigger` argument",
  BOTH_TRIGGER_AND_ACTION_NAME: "You can't pass both an `actionName` and a `trigger` argument. Just pass one",
  SCHEDULE_ACTION_MISSING: "You need to pass an `action` argument for the thing you want to schedule",
  UNSCHEDULE_ACTION_MISSING: "You need to pass an `action` argument for the thing you want to unschedule",
  RECURRENCE_MISSING: "You need to pass a `recurrence` argument to specify when you want to schedule the action to recur, e.g. \"every weekday at 9am\"",
  GRAPHQL_QUERY_MISSING: "You need to pass a `query` argument containing the GraphQL query you want to execute",
  EMAIL_MISSING: "You need to pass an `email` argument containing an email address you want to lookup"
};
