class EllipsisApiError extends Error {
  constructor(props) {
    const bodyString = (typeof props.body === "object") ? JSON.stringify(props.body) : String(props.body);
    const errorMessage = `${props.response.statusCode}: ${props.response.statusMessage}
${bodyString}`;
    super(errorMessage);
    this.response = props.response;
    this.body = props.body;
  }
}

module.exports = EllipsisApiError;
