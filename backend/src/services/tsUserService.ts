import { TsUserDetailedDTO, TsUserMinimalDTO, TsUserRegistrationDTO } from "../controllers/tsUserController.js";
import { isExistNotUsedIdCardImage } from "../dal/idCardImageDal.js"
import { createTsUser, getTsUserBio } from "../dal/tsUserDal.js";
import { error, Result, success } from "../utils/result.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import { UserRegistrationSchema } from "../validators/tsUserValidators.js";
import bcrypt from "bcrypt";

// make a service error interface with common service exception and and it with service specific errors
// db error as serviceError
// then union the type with InvalidIdCardImageError ,
// like that construct the service layer's error as value mechanism
// also dont forgot to rename the prismaError as DalError.
// see you tomorrow

export async function registerTsUser(params: TsUserRegistrationDTO): Promise<Result<TsUserMinimalDTO, ServiceError>> {

  const safeParams = UserRegistrationSchema.safeParse(params);

  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    })
  }

  const idCardValidityQuery = await isExistNotUsedIdCardImage(params.idCardImageFileName);

  if(! idCardValidityQuery.success) { // db query faild  here
    return error({
      cause: 'DbError',
      message: 'Cant find the validity of id card image.'
    });
  }

  if(! idCardValidityQuery.success) { //not valid id card image
    return error({
      cause: 'BussinessConstraintViolation',
      message: 'Id card image file name is not valid.'
    })
  }

  const passHash = await bcrypt.hash(safeParams.data.password, 9);

  const userCreationResponse = await createTsUser({
    ...safeParams.data,
    emailVerified: false,
    // TODO
    // implement a otp mechanism to verify the email owner on creation time.
    // now allowing user to verify their email later
    internal: false, // starting with everyone as external, admin should toggle it.
    userVerified: false,
    passHash: passHash
  });

  if(! userCreationResponse.success) {
    switch(userCreationResponse.error.cause) {
      case "DuplicateRecord":
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "KnownRequestError":
        return error({
          cause: 'BussinessConstraintViolation',
          message: userCreationResponse.error.message
        })
      case "ValidationError":
        return error({
        cause: 'ValidationError',
        message: userCreationResponse.error.message
      })
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: userCreationResponse.error.message
      })
    }
  }

  return success({
    id: userCreationResponse.value.id,
    salutation: userCreationResponse.value.salutation,
    name: userCreationResponse.value.name,
    accountType: userCreationResponse.value.accountType
  } satisfies TsUserMinimalDTO);
}

async function getTsUser(id: number): Promise<Result<TsUserDetailedDTO, ServiceError>> {
  const bioRequest = await getTsUserBio(id);

  if(! bioRequest.success) {
    switch(bioRequest.error.cause) {
      case "DuplicateRecord":
      case "RecordNotFound":
      return error({
        cause: 'NotFoundError',
        message: 'ts user not found.'
      })
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      return error({
        cause: 'BussinessConstraintViolation',
        message: 'ts user cannot be fetched.'
      })
      case "DbUnAvailableError":
      case "UnknownRequestError":
      return error({
        cause: 'DbError',
        message: 'ts user cannot be fetched currently.'
      })
    }
  }
  bioRequest.value

}

async function updateContact() {
}
async function updateWorkPlace() {
}
async function theoryCoursesHandled() {
}
async function practicalCoursesHandled() {
}
