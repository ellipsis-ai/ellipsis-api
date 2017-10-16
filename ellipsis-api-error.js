class EllipsisApiError extends Error {
  constructor(props) {
    const errorMessage = `${props.response.statusCode}: ${props.response.statusMessage}
${props.body}`;
    super(errorMessage);
    this.response = props.response;
    this.body = props.body;
  }
}

module.exports = EllipsisApiError;
