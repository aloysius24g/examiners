import bcrypt from "bcrypt";
import { credentialDTO } from "../controllers/sessionController.js";
import { getTsUserUsingEmail } from "../dal/tsUserDal.js";
import { error, Result, success } from "../utils/result.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import envProvider from "../utils/envProvider.js";
import jwt from 'jsonwebtoken';
import { TsUserMinimalDTO } from "../controllers/tsUserController.js";
import { credentialSchema } from "../validators/sessionValidators.js";
import { getNsUserByUserName } from "../dal/nsUserDal.js";
import { NsUserMinimalDTO } from "../controllers/nsUserController.js";

export async function login(credentialParams: credentialDTO):
  Promise<Result<string, ServiceError | {cause: 'WrongCredentials', message: string}>>
{
  let jwtRefreshToken: string | undefined;

  const params = credentialSchema.safeParse(credentialParams);
  if(! params.success) {
    return error({
      cause: 'ValidationError',
      message: params.error.issues.map(i => i.message).join('\n')
    })
  }
  if(params.data.accountType === 'TS') {
    const fetchResponse = await getTsUserUsingEmail(params.data.email);
    if(! fetchResponse.success) {
      switch(fetchResponse.error.cause) {
        case "RecordNotFound":
        return error({
          cause: 'NotFoundError',
          message: 'cant find the user associated with the email.'
        })
        case "ForeignKeyViolation":
        case "KnownRequestError":
        case "UnknownRequestError":
        case "DbUnAvailableError":
        case "ValidationError":
        case "DuplicateRecord":
        return error({
          cause: 'DbError',
          message: fetchResponse.error.message
        })
      }
    }
    const isRightCredentials = await bcrypt.compare(
      params.data.password,
      fetchResponse.value.coreDetails.passHash
    );

    if(! isRightCredentials) {
      return error({
        cause: 'WrongCredentials',
        message: 'email and password does not match.'
      })
    }
    jwtRefreshToken = jwt.sign(
      {
        id: fetchResponse.value.coreDetails.id,
        accountType: fetchResponse.value.coreDetails.accountType,
        salutation: fetchResponse.value.coreDetails.salutation,
        name: fetchResponse.value.coreDetails.name
      } satisfies TsUserMinimalDTO,
      envProvider.JWT_REFRESH_TOKEN_SEC,
      {
        expiresIn: '5m'
      }
    )
    return success(jwtRefreshToken);
  }

  if(params.data.accountType === 'NS') {
    const fetchResponse = await getNsUserByUserName(params.data.userName);
    if(! fetchResponse.success) {
      switch(fetchResponse.error.cause) {
        case "RecordNotFound":
        return error({
          cause: 'NotFoundError',
          message: 'cant find the user associated with the username.'
        })
        case "ForeignKeyViolation":
        case "KnownRequestError":
        case "UnknownRequestError":
        case "DbUnAvailableError":
        case "ValidationError":
        case "DuplicateRecord":
        return error({
          cause: 'DbError',
          message: fetchResponse.error.message
        })
      }
    }
    const isRightCredentials = await bcrypt.compare(
      params.data.password,
      fetchResponse.value.coreDetails.passHash
    );

    if(! isRightCredentials) {
      return error({
        cause: 'WrongCredentials',
        message: 'username and password does not match.'
      })
    }
    jwtRefreshToken = jwt.sign(
      {
        id: fetchResponse.value.coreDetails.id,
        accountType: fetchResponse.value.coreDetails.accountType,
        salutation: fetchResponse.value.coreDetails.salutation,
        name: fetchResponse.value.coreDetails.name
      } satisfies NsUserMinimalDTO,
      envProvider.JWT_REFRESH_TOKEN_SEC,
      {
        expiresIn: '5m'
      }
    )
    return success(jwtRefreshToken);
  }

  return error({
    cause: 'ValidationError',
    message: 'user type should either NS or TS'
  })
}
