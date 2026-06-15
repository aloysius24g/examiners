import { Prisma } from "../../generated/prisma/client.js";
import { error, Result } from "./result.js";

type PrismaError =
  | {
      cause: 'DuplicateRecord';
      message: string;
      fields?: unknown;
    }
  | {
      cause: 'RecordNotFound';
      message: string;
      fields?: unknown;
    }
  | {
      cause: 'ForeignKeyViolation';
      message: string;
      fields?: unknown;
    }
  | {
      cause: 'ValidationError';
      message: string;
    }
  | {
      cause: 'KnownRequestError';
      code: string;
      message: string;
      meta?: unknown;
    }
  | {
      cause: 'UnknownRequestError';
      message: string;
    }
  | {
      cause: 'DbUnAvailableError';
      message: string;
    };

function prismaErrorAsValue(e: unknown): Result<never, PrismaError> {
  if(! (e instanceof Error)) {
    throw e;
  }

  if(e instanceof Prisma.PrismaClientValidationError) { // throwed when invalid types supplied 
    //on crud operation
    return error({
      cause: 'ValidationError',
      message: e.message
    })
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2002':
        return error({
        cause: 'DuplicateRecord',
        message: e.message,
        fields: e.meta?.target
      });

      case 'P2025':
        return error({
        cause: 'RecordNotFound',
        message: e.message,
        fields: e.meta?.target
      });

      case 'P2003':
        return error({
        cause: 'ForeignKeyViolation',
        message: e.message,
        fields: e.meta?.target
      });

      default:
        return error({
        cause: 'KnownRequestError',
        code: e.code,
        message: e.message,
        meta: e.meta
      });
    }
  }

  if(e instanceof Prisma.PrismaClientKnownRequestError) { // throwed when expected violation happens
    // for eg a constrain violation on crud operation
    return error({
      cause: 'KnownRequestError',
      message: e.message,
      meta: e.meta,
      code: e.code
    })
  }

  if(e instanceof Prisma.PrismaClientUnknownRequestError) { // throwed when unexpected violation happens
    // for eg a constrain violation on crud operation
    return error({
      cause: 'UnknownRequestError',
      message: e.message
    })
  }

  if(
    e instanceof Prisma.PrismaClientInitializationError
    || e instanceof Prisma.PrismaClientRustPanicError
  ) {
    return error({
      cause: 'DbUnAvailableError',
      message: 'The database is currently unavailable'
    })
  }

  throw e;
}

export default prismaErrorAsValue;
