class HTTPError extends Error {
  public readonly originError: Error | null = null;
  constructor(message: string, options? : {originError?: Error}) {
    super(message);
    this.name = 'HTTPError'
    Object.assign(this, options)
    return this;
  }
}

class BadRequestError extends HTTPError{
  public readonly name: string
  constructor(message: string, options?: {originError?: Error}) {
    super(message, options);
    this.name = 'BadRequestError';
    Object.assign(this, options);
    return this;
  }
}
class ResourceNotFoundError extends HTTPError{
  public readonly name: string
  constructor(message: string, options?: {originError?: Error}) {
    super(message, options);
    this.name = 'ResourceNotFoundError';
    Object.assign(this, options);
    return this;
  }
}

class UnAuthorisedError  extends HTTPError{
  public readonly name: string
  constructor(message: string, options?: {originError?: Error}) {
    super(message, options);
    this.name = 'UnAuthorisedError';
    Object.assign(this, options);
    return this;
  }
}

class ForbiddenError  extends HTTPError{
  public readonly name: string
  constructor(message: string, options?: {originError?: Error}) {
    super(message, options);
    this.name = 'ForbiddenError';
    Object.assign(this, options);
    return this;
  }
}

class InternalServerError  extends HTTPError{
  public readonly name: string
  constructor(message: string, options?: {originError?: Error}) {
    super(message, options);
    this.name = 'ForbiddenError';
    Object.assign(this, options);
    return this;
  }
}

class CriticalError extends HTTPError{
  public readonly name: string
  constructor(message: string, options?: {originError?: Error}) {
    super(message, options);
    this.name = 'CriticalError';
    Object.assign(this, options);
    return this;
  }
}

export {
  BadRequestError,
  ResourceNotFoundError,
  ForbiddenError,
  UnAuthorisedError,
  InternalServerError,
  CriticalError
};
