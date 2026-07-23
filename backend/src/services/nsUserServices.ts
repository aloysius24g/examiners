import { NsUserDetailedDTO, NsUserMinimalDTO, NsUserRegistrationDTO } from "../controllers/nsUserController.js";
import * as nsDal from "../dal/nsUserDal.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import bcrypt from "bcrypt";
import { nsUserRegistrationSchema } from "../validators/nsUserValidators.js";
import { error, Result, success } from "../utils/result.js";
import { getUserContext } from "../utils/userContext.js";
import { abilitiesFor } from "./permissions.js";

export async function registerNsUser(params: NsUserRegistrationDTO): Promise<Result<NsUserMinimalDTO, ServiceError>> {

  const safeParams = nsUserRegistrationSchema.safeParse(params);

  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    })
  }

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('create', 'officer')) {
    return error({
      cause: 'PermissionError',
      message: 'Ns user creation is only available for logged in internal users.'
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
    id: userCreationRes.value.coreDetails.id,
    name: userCreationRes.value.coreDetails.name,
    salutation: userCreationRes.value.coreDetails.salutation,
    accountType: userCreationRes.value.coreDetails.accountType,
    roleName: userCreationRes.value.roleName
  } satisfies NsUserMinimalDTO);
}

export async function getNsUser(id: number): Promise<Result<NsUserDetailedDTO, ServiceError>> {

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('view', {kind: 'officer', id: id})) {
    return error({
      cause: 'PermissionError',
      message: 'Ns user can only be viewed by authorized users only'
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

export async function updateActiveStatus(id: number, active: boolean)
: Promise<Result<boolean, ServiceError>> {
  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', 'officerActiveStatus')) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update active status.'
    });
  }

  const updateRes = await nsDal.markIsActive(id, active);
  if(! updateRes.success) {
    switch(updateRes.error.cause) {
      case "ValidationError":
      case "KnownRequestError":
        return error({
          cause: 'ValidationError',
          message: updateRes.error.message
        });
      case "DuplicateRecord":
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        return error({
          cause: 'DbError',
          message: updateRes.error.message
        });
    }
  };

  return success(updateRes.value);
}
