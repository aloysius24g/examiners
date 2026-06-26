import { NsUserDetailedDTO, NsUserMinimalDTO, NsUserRegistrationDTO } from "../controllers/nsUserController.js";
import * as nsDal from "../dal/nsUserDal.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import bcrypt from "bcrypt";
import { nsUserRegistrationSchema } from "../validators/nsUserValidators.js";
import { error, Result, success } from "../utils/result.js";
import { getUserContext } from "../utils/userContext.js";

export async function registerNsUser(params: NsUserRegistrationDTO): Promise<Result<NsUserMinimalDTO, ServiceError>> {

  const safeParams = nsUserRegistrationSchema.safeParse(params);

  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    })
  }

  const userContext = getUserContext();
  if(userContext === null || userContext?.accountType !== 'NS') {
    return error({
      cause: 'PermissionError',
      message: 'Ns user creation is only available for logged in internal users.'
    })
  }

  const nsUserRes = await nsDal.getNsUserById(userContext.id);

  if(! nsUserRes.success) {
    return error({
      cause: 'DbError',
      message: 'cannot find the logged in user\'s info.'
    })
  }

  if(nsUserRes.value.roleName !== 'coe') {
    return error({
      cause: 'PermissionError',
      message: 'ns user can only be created by accout with coe role.'
    })
  }

  const passHash = await bcrypt.hash(safeParams.data.password, 9);

  const userCreationRes = await nsDal.createNsUser({
    userName: safeParams.data.userName,
    saluation: safeParams.data.salutation,
    name: safeParams.data.name,
    roleName: safeParams.data.roleName,
    passHash: passHash,
  });

  if(! userCreationRes.success) {
    switch(userCreationRes.error.cause) {
      case "DuplicateRecord":
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "KnownRequestError":
        return error({
          cause: 'BussinessConstraintViolation',
          message: userCreationRes.error.message
        })
      case "ValidationError":
        return error({
        cause: 'ValidationError',
        message: userCreationRes.error.message
      })
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: userCreationRes.error.message
      })
    }
  }
  return success({
    id: userCreationRes.value.id,
    name: userCreationRes.value.name,
    salutation: userCreationRes.value.salutation,
    accountType: userCreationRes.value.accountType,
  } satisfies NsUserMinimalDTO);
}

export async function getNsUser(id: number): Promise<Result<NsUserDetailedDTO, ServiceError>> {

  const userContext = getUserContext();
  if(userContext === null || userContext?.accountType !== 'NS') {
    return error({
      cause: 'PermissionError',
      message: 'Ns user can only be viewed by authorized users only'
    })
  }

  const loggedUserRes = await nsDal.getNsUserById(userContext.id);

  if(! loggedUserRes.success) {
    return error({
      cause: 'DbError',
      message: 'cannot find the logged in user\'s info.'
    })
  }

  // access only to coe
  // and themselves
  if(! (loggedUserRes.value.roleName === 'coe' || loggedUserRes.value.userId === userContext.id)) {
    return error({
      cause: 'PermissionError',
      message: 'ns user can only viewed by previledge user or themselves.'
    })
  }
  const userFetchRes = await nsDal.getNsUserById(id)

  if(! userFetchRes.success) {
    switch(userFetchRes.error.cause) {
      case "RecordNotFound":
      return error({
        cause: 'NotFoundError',
        message: 'ts user not found.'
      })
      case "ValidationError":
      case "KnownRequestError":
      case "DbUnAvailableError":
      case "UnknownRequestError":
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      return error({
        cause: 'DbError',
        message: 'ts user cannot be fetched currently.'
      })
    }
  }
  return success({
    userName: userFetchRes.value.userName,
    salutation: userFetchRes.value.coreDetails.salutation,
    name: userFetchRes.value.coreDetails.name,
    roleName: userFetchRes.value.roleName,
  } satisfies NsUserDetailedDTO)
}
