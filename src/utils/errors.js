export class HttpError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
      this.name = "HttpError";
    }
  }
  
export  class BadRequest extends HttpError {
    constructor(message = "Bad Request") {
      super(400, message);
      this.name = "BadRequest";
    }
  }
  
export  class NotFound extends HttpError {
    constructor(message = "Not Found") {
      super(404, message);
      this.name = "NotFound";
    }
  }
  
export  class Unauthorized extends HttpError {
    constructor(message = "Unauthorized") {
      super(401, message);
      this.name = "Unauthorized";
    }
  }