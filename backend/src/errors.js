/** An error whose status and message are safe to send to the client. */
export class AppError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = "AppError";
    this.status = status;
  }
}
