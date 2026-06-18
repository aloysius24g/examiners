export type ServiceError = 
  | {
    cause: 'DbError',
    message: string
  }
  | {
    cause: 'ValidationError',
    message: string
  }
  | {
    cause: 'BussinessConstraintViolation',
    message: string
  }
  | {
    cause: 'PermissionError',
    message: string,
  }
  | {
    cause: 'NotFoundError',
    message: string,
  }
