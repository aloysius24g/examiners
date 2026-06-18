export class HttpError extends Error {
  public readonly originError: Error | null = null;
  public readonly statusCode: number;
  constructor(statusCode: number, message: string, options? : {originError?: Error}) {
    super(message);
    this.name = 'HTTPError'
    this.statusCode = statusCode
    Object.assign(this, options)
    return this;
  }
}

/** 400 Bad Request */
export class BadRequestError extends HttpError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

/** 403 Forbidden */
export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

/** 404 Not Found */
export class NotFoundError extends HttpError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

/** 409 Conflict */
export class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

/** 422 Validation Error */
export class ValidationError extends HttpError {
  constructor(message = "Validation Failed") {
    super(422, message);
  }
}

/** 500 Internal Server Error */
export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}
