import { TsUserDetailedDTO, TsUserMinimalDTO, TsUserRegistrationDTO } from "../controllers/tsUserController.js";
import { isExistNotUsedIdCardImage } from "../dal/idCardImageDal.js"
import { createTsUser, getTsUserBio, getTsUserContact, getTsUserPracticalCourses, getTsUserTheoryCourses } from "../dal/tsUserDal.js";
import { error, Result, success } from "../utils/result.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import { getUserContext, userAls } from "../utils/userContext.js";
import { tsUserRegistrationSchema } from "../validators/tsUserValidators.js";
import bcrypt from "bcrypt";

export async function registerTsUser(params: TsUserRegistrationDTO): Promise<Result<TsUserMinimalDTO, ServiceError>> {

  const safeParams = tsUserRegistrationSchema.safeParse(params);

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

export async function getTsUser(id: number): Promise<Result<TsUserDetailedDTO, ServiceError>> {

  const userContext = getUserContext();

  if(userContext === null) {
    return error({
      cause: 'PermissionError',
      message: 'This resource is not available to public users'
    })
  }

  if(userContext.accountType !== 'NS') {
    return error({
      cause: 'PermissionError',
      message: 'This resource is not available to internal users'
    })
  }


  const bioRequest = await getTsUserBio(id);

  if(! bioRequest.success) {
    switch(bioRequest.error.cause) {
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

  const contactRequest = await getTsUserContact(id);

  if(! contactRequest.success) {
    switch(contactRequest.error.cause) {
      case "RecordNotFound":
      return error({
        cause: 'NotFoundError',
        message: 'ts user not found.'
      })
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: 'ts user cannot be fetched currently.'
      })
    }
  }

  const theoryHandledRequest = await getTsUserTheoryCourses(id)

  if(! theoryHandledRequest.success) {
    switch(theoryHandledRequest.error.cause) {
      case "RecordNotFound":
        return error({
        cause: 'NotFoundError',
        message: 'ts user not found.'
      })
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: 'ts user cannot be fetched currently.'
      })
    }
  }

  const practicalHandledRequest = await getTsUserPracticalCourses(id)

  if(! practicalHandledRequest.success) {
    switch(practicalHandledRequest.error.cause) {
      case "RecordNotFound":
        return error({
        cause: 'NotFoundError',
        message: 'ts user not found.'
      })
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: 'ts user cannot be fetched currently.'
      })
    }
  }

  return success({
    bio: {
      salutation: bioRequest.value.name,
      name: bioRequest.value.name,
      aicteNo: bioRequest.value.aicteNo,
      annaUnivNo: bioRequest.value.annaUnivNo,
      yearOfExperience: bioRequest.value.yearOfExperience
    },
    workPlace: {
      department: bioRequest.value.department,
      designation: bioRequest.value.designation,
      collegeName: bioRequest.value.collegeName,
      collegePlace: bioRequest.value.collegePlace,
      collegePinCode: bioRequest.value.collegePinCode,
      internal: bioRequest.value.internal
    },
    contact: {
      ...contactRequest.value
    },
    theoryHandled: theoryHandledRequest.value,
    practicalHandled: practicalHandledRequest.value

  } satisfies TsUserDetailedDTO)
}

async function updateContact() {
}
async function updateWorkPlace() {
}
async function theoryCoursesHandled() {
}
async function practicalCoursesHandled() {
}
