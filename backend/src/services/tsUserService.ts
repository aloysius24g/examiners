import { ContactDTO, ContactDTOWithOTP, PasswordResetDTO, TsUserDetailedDTO, TsUserListDTO, TsUserMinimalDTO, TsUserRegistrationDTO, UpdatablePersonalInfoDTO, WorkPlaceDTO } from "../controllers/tsUserController.js";
import * as otpService from '../services/otpService.js';
import { isExistNotUsedIdCardImage } from "../dal/idCardImageDal.js"
import * as tsUserDal from "../dal/tsUserDal.js";
import * as courseDal from '../dal/courseDal.js';
import { error, Result, success } from "../utils/result.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import { getUserContext } from "../utils/userContext.js";
import { contactInputSchema, preferencesSchema, resetPasswordSchema, tsUserRegistrationSchema, updatablePersonalInfoSchema, workplaceSchema } from "../validators/tsUserValidators.js";
import bcrypt from "bcrypt";
import { abilitiesFor } from "./permissions.js";
import { CourseDTO } from "../controllers/courseController.js";
import { courseListSchema } from "../validators/courseValidators.js";

export async function registerTsUser(params: TsUserRegistrationDTO): Promise<Result<TsUserMinimalDTO, ServiceError>> {

  const safeParams = tsUserRegistrationSchema.safeParse(params);

  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    })
  }

  // check user permissions
  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('create', 'examiner')) {
    return error({
      cause: 'PermissionError',
      message: 'User has not enough permission to create an examiner account.'
    })
  }

  // check if the provided email has otp.
  const otpVerificationRes = await otpService.verifyOtp(safeParams.data.email, safeParams.data.otp);

  if(! otpVerificationRes.success) {
    return otpVerificationRes; // here i am using a servie call withing this service.
    //just return the returned value if fails.
  }

  // check if their id card image is valid
  const idCardValidityQuery = await isExistNotUsedIdCardImage(safeParams.data.idCardImageFileName);

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

  const userCreationResponse = await tsUserDal.createTsUser({
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

  await otpService.invalidateOtp(safeParams.data.email);
  // TODO
  // at this point user is created
  // should we use transactions and rollback if this fails.
  // ideally it is the right thing to do. but this is okay.
  // should we check if this fails or not
  // In this file this line is used in similar way many times, check that out too. 

  return success({
    id: userCreationResponse.value.id,
    salutation: userCreationResponse.value.salutation,
    name: userCreationResponse.value.name,
    accountType: userCreationResponse.value.accountType
  } satisfies TsUserMinimalDTO);
}

export async function getTsUser(id: number): Promise<Result<TsUserDetailedDTO, ServiceError>> {

  const userContext = getUserContext();

  const ability = abilitiesFor(userContext);
  if(ability.cannot('view', {kind: 'examiner', id: id})) {
    return error({
      cause: 'PermissionError',
      message: 'This resource is only available to internal users and the user themselves.'
    })
  }

  const bioRequest = await tsUserDal.getTsUserBio(id);

  if(! bioRequest.success) {
    switch(bioRequest.error.cause) {
      case "RecordNotFound":
      return error({
        cause: 'NotFoundError',
        message: 'examiner not found.'
      })
      case "ValidationError":
      case "KnownRequestError":
      case "DbUnAvailableError":
      case "UnknownRequestError":
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      return error({
        cause: 'DbError',
        message: 'examiner cannot be fetched currently.'
      })
    }
  }

  const contactRequest = await tsUserDal.getTsUserContact(id);

  if(! contactRequest.success) {
    switch(contactRequest.error.cause) {
      case "RecordNotFound":
      return error({
        cause: 'NotFoundError',
        message: 'examiner user not found.'
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

  const theoryHandledRequest = await tsUserDal.getTsUserTheoryCourses(id)

  if(! theoryHandledRequest.success) {
    switch(theoryHandledRequest.error.cause) {
      case "RecordNotFound":
        return error({
        cause: 'NotFoundError',
        message: 'examiner user not found.'
      })
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: 'examiner cannot be fetched currently.'
      })
    }
  }

  const practicalHandledRequest = await tsUserDal.getTsUserPracticalCourses(id)

  if(! practicalHandledRequest.success) {
    switch(practicalHandledRequest.error.cause) {
      case "RecordNotFound":
        return error({
        cause: 'NotFoundError',
        message: 'examiner not found.'
      })
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: 'examiner cannot be fetched currently.'
      })
    }
  }

  const resDto = ({
    bio: {
      salutation: bioRequest.value.name,
      name: bioRequest.value.name,
      aicteNo: bioRequest.value.aicteNo,
      annaUnivNo: bioRequest.value.annaUnivNo,
      yearOfExperience: bioRequest.value.yearOfExperience,
      department: bioRequest.value.department
    },
    workPlace: {
      designation: bioRequest.value.designation,
      collegeName: bioRequest.value.collegeName,
      collegePlace: bioRequest.value.collegePlace,
      collegePinCode: bioRequest.value.collegePinCode,
      internal: bioRequest.value.internal,
      idCardImageFileName: bioRequest.value.idCardImageFileName
    },
    contact: {
      ...contactRequest.value
    },
    theoryHandled: theoryHandledRequest.value,
    practicalHandled: practicalHandledRequest.value,
    theoryCoursesLastUpdated: bioRequest.value.theoryCoursesLastUpdated?.toISOString() ?? null,
    practicalCoursesLastUpdated: bioRequest.value.practicalCoursesLastUpdated?.toISOString() ?? null, 
    ...(ability.can('view', 'examinerPrivateFields') ?
        {
          userVerified: bioRequest.value.userVerified, 
          userBlacklisted: bioRequest.value.userBlacklisted,
          preferences: bioRequest.value.preferredFor,
          phoneVerified: false, //TODO not using this field for now, may be in future.
          emailVerified: true, //TODO not allowing user to submit email wihout verifying
          //imedietly. maybe use it in future
          //just for the sake of specifying these fields in api contract
          //i am adding this to return from this service. 
        }
        : {}
       )
  } satisfies TsUserDetailedDTO);

  return success(resDto);
}

export async function getTsUsers():
  Promise<Result<TsUserListDTO, ServiceError>> {

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('view', 'examinerList')) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission for viewing examiner list.'
    })
  }

  const getRes = await tsUserDal.getTsUsers();
  if(! getRes.success) {
    switch(getRes.error.cause) {
      case "DuplicateRecord":
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        return error({
          cause: 'DbError',
          message: 'cannot get ts users.'
        })
    }
  }
  const tsUsersRaw = getRes.value;
  // undefined in the following cases means: thre is no valid latest updated on theory/practical
  // courses.
  const tsUsersFormatted: TsUserListDTO | undefined = tsUsersRaw.map(raw => {

    const practicalLatestUpdateTime = raw.practicalCoursesLastUpdated;
    const theoryLatestUpdateTime = raw.theoryCoursesLastUpdated;

    return {
      id: raw.userId,
      bio: {
        name: raw.coreDetails.name,
        salutation: raw.coreDetails.salutation,
        aicteNo: raw.aicteNo,
        annaUnivNo: raw.annaUnivNo,
        department: raw.department,
        yearOfExperience: raw.yearOfExperience,
      },
      workPlace: {
        collegeName: raw.collegesWorked[0]?.collegeName as string,
        collegePlace: raw.collegesWorked[0]?.collegePlace as string,
        collegePinCode: raw.collegesWorked[0]?.collegePinCode as string,
        designation: raw.collegesWorked[0]?.designation as string,
        idCardImageFileName: raw.collegesWorked[0]?.idCardImageFileName as string,
        internal: raw.internal
      },
      contact: {
        email: raw.email,
        phone: raw.phone,
      },
        // latest by chosenTime
      practicalHandled: raw.practicalsHandled.
        filter(p => p.chosenTime.getTime() === practicalLatestUpdateTime?.getTime()).
        map(p => ({courseTitle: p.courseTitle, courseCode: p.courseCode})),
      theoryHandled: raw.theoriesHandled.
        filter(p => p.chosenTime.getTime() === theoryLatestUpdateTime?.getTime()).
        map(p => ({courseTitle: p.courseTitle, courseCode: p.courseCode})),
      
      // internal fields
      ...(ability.can('view', 'examinerPrivateFields') ?
          {
            userVerified: raw.userVerified,
            userBlacklisted: raw.userBlacklisted, 
            emailVerified: raw.emailVerified,
            phoneVerified: raw.phoneVerified,
            preferences: raw.preferences.map(p => p.preferredFor)
          }: {}
         )
    }
  });   

  return success(tsUsersFormatted);
}

export async function updateContact(id: number, input: ContactDTOWithOTP):
  Promise<Result<ContactDTO, ServiceError>> {

  const safeInput = contactInputSchema.safeParse(input);

  if(! safeInput.success) {
    return error({
      cause: 'ValidationError',
      message: safeInput.error.issues.map(i => i.message).join('\n')
    });
  }

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', {kind: 'contact', userId: id})) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update the contact.'
    })
  }

  // check if the provided email has otp.
  const otpVerificationRes = await otpService.verifyOtp(safeInput.data.email, safeInput.data.otp);
  if(! otpVerificationRes.success) {
    return otpVerificationRes;
  }

  const updateResult = await tsUserDal.updateTsContact(id, safeInput.data);
  if(! updateResult.success) {
    switch(updateResult.error.cause) {
      case "DuplicateRecord":
        return error({
          cause: 'BussinessConstraintViolation',
          message: updateResult.error.message
        })
      case "ValidationError":
      case "KnownRequestError":
        return error({
          cause: 'ValidationError',
          message: updateResult.error.message
        })
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        return error({
          cause: 'DbError',
          message: updateResult.error.message
        })
    }
  }

  await otpService.invalidateOtp(safeInput.data.email);

  return success(updateResult.value);
}

export async function updateWorkPlace(id: number, input: WorkPlaceDTO)
: Promise<Result<WorkPlaceDTO, ServiceError>> {

  const safeParams = workplaceSchema.safeParse(input);
  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    });
  }

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', {kind: 'workPlace', userId: id})) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update workplace.'
    });
  }

  // check if the new id card image is unused.
  const idCardImageValidityRes = await isExistNotUsedIdCardImage(
    safeParams.data.idCardImageFileName
  );
  if(! idCardImageValidityRes.success) {
    switch(idCardImageValidityRes.error.cause) {
      case "DuplicateRecord":
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        return error({
          cause: 'DbError',
          message: idCardImageValidityRes.error.message 
        });
    }
  }

  if(idCardImageValidityRes.value !== true) {
    return error({
      cause: 'ValidationError',
      message: 'Id card image is invalid.'
    });
  }

  const updateResponse = await tsUserDal.updateWorkPlace(id, safeParams.data);
  if(! updateResponse.success) {
    switch(updateResponse.error.cause) {
      case "DuplicateRecord":
      case "ForeignKeyViolation":
        return error({
          cause: 'BussinessConstraintViolation',
          message: updateResponse.error.message
        });
      case "ValidationError":
      case "KnownRequestError":
      return error({
        cause: 'ValidationError',
        message: updateResponse.error.message
      });
      case "RecordNotFound":
      case "UnknownRequestError":
      case "DbUnAvailableError":
      return error({
        cause: 'DbError',
        message: updateResponse.error.message
      });
    }
  }

  return success(updateResponse.value);
}

export async function updateCoursesHandled(
  courseType: 'practical' | 'therory',
  id: number,
  input: CourseDTO[]
): Promise<Result<CourseDTO[], ServiceError>>{

  const safeParams = courseListSchema.safeParse(input);
  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    });
  }

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', {kind: 'coursesHandled', userId: id})) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to updating theory courses handled.'
    });
  }

  let dalUpdateFn;
  let availableCoursesRes;
  if(courseType === 'practical') {
    dalUpdateFn = tsUserDal.updatePracticalCourses;
    availableCoursesRes = await courseDal.getPracticalCourses();
  } else if(courseType === 'therory') {
    dalUpdateFn = tsUserDal.updateTheoryCourses;
    availableCoursesRes = await courseDal.getTheoryCourses();
  } else {
    return error({
      cause: 'ValidationError',
      message: 'Unexpected course type.'
    })
  }

  if(! availableCoursesRes.success) {
    return error({ // this is okay for now, since this is coming from mem and not from db
      // so, failing on this step is least likely.
      cause: 'DbError',
      message: 'Courses cannot be fetched.'
    });
  }

  const updatableCourses = safeParams.data 
  const availableCourses = availableCoursesRes.value;
  for(const c of updatableCourses) {
    const match = availableCourses.
      find(ac => ac.courseCode === c.courseCode && ac.courseTitle === c.courseTitle);
    if(match === undefined) {
      return error({
        cause: 'ValidationError',
        message: `Course with code ${c.courseCode} and ${c.courseTitle} is not available.`
      });
    }
  }

  const updateResponse = await dalUpdateFn(id,updatableCourses);
  if(! updateResponse.success) {
    switch(updateResponse.error.cause) {
      case "DuplicateRecord":
      case "ForeignKeyViolation":
        return error({
          cause: 'BussinessConstraintViolation',
          message: updateResponse.error.message
        });
      case "ValidationError":
      case "KnownRequestError":
        return error({
          cause: 'ValidationError',
          message: updateResponse.error.message
        });
      case "RecordNotFound":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        return error({
          cause: 'DbError',
          message: updateResponse.error.message
        });
    }
  }

  return success(updateResponse.value);
}

export async function updatePersonalInformation(id: number, params: UpdatablePersonalInfoDTO)
: Promise<Result<UpdatablePersonalInfoDTO, ServiceError>> {

  const safeInput = updatablePersonalInfoSchema.safeParse(params);
  if(! safeInput.success) {
    return error({
      cause: 'ValidationError',
      message: safeInput.error.issues.map(i => i.message).join('\n')
    })
  }
  
  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', {kind: 'personalInformation', userId: id})) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update personal information.'
    });
  }

  const updateRes = await tsUserDal.updatePersonalInformation(id, safeInput.data);
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
  }

  return success(updateRes.value)
}

export async function updateIsVerified(id: number, verified: boolean):
  Promise<Result<boolean, ServiceError>> {

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', 'examinerAuthenticity')) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update authenticity.'
    });
  }

  const updateRes= await tsUserDal.markIsVerified(id, verified);
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
  }

  return success(updateRes.value); 
}

export async function updateIsBlacklisted(id: number, blacklisted: boolean):
  Promise<Result<boolean, ServiceError>> {

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', 'examinerAuthenticity')) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update authenticity.'
    });
  }

  const updateRes = await tsUserDal.updateBlackListed(id, blacklisted);
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
  }

  return success(updateRes.value); 
}

export async function updatePassword(params: PasswordResetDTO):
  Promise<Result<void, ServiceError>> {

  const safeParams = resetPasswordSchema.safeParse(params);
  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: safeParams.error.issues.map(i => i.message).join('\n')
    })
  }

  //const userContext = getUserContext();
  //const ability = abilitiesFor(userContext);
  //NOTE : this is not a protected service entity, skippin the requesting user's permission.
  
  
  // check if the provided email has otp.
  const otpVerificationRes = await otpService.verifyOtp(safeParams.data.email, safeParams.data.otp);
  if(! otpVerificationRes.success) {
    return otpVerificationRes; // here i am using a servie call withing this service.
    //just return the returned value if fails.
  }

  const newPassHash = await bcrypt.hash(safeParams.data.newPassword, 9);

  const updateRes = await tsUserDal.updatePassHash(safeParams.data.email, newPassHash);
  if(! updateRes.success) {
    switch(updateRes.error.cause) {
      case "ValidationError":
      case "KnownRequestError":
        return error({
          cause: 'ValidationError',
          message: updateRes.error.message
        });
      case "RecordNotFound":
        return error({
          cause: 'NotFoundError',
          message: updateRes.error.message
        });
      case "DuplicateRecord":
      case "ForeignKeyViolation":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        return error({
          cause: 'DbError',
          message: updateRes.error.message
        });
    }
  }

  await otpService.invalidateOtp(safeParams.data.email);

  return success(undefined); 
}

export async function updatePreferences(id: number, preferences: string[]):
  Promise<Result<string[], ServiceError>>{

  const safePreferences = preferencesSchema.safeParse(preferences);
  if(! safePreferences.success) {
    if(! safePreferences.success) {
      return error({
        cause: 'ValidationError',
        message: safePreferences.error.issues.map(i => i.message).join('\n')
      })
    }
  }

  const userContext = getUserContext();
  const ability = abilitiesFor(userContext);
  if(ability.cannot('update', 'examinerPreference')) {
    return error({
      cause: 'PermissionError',
      message: 'Not enough permission to update personal information.'
    });
  }

  const updateRes = await tsUserDal.updatePreferences(id, safePreferences.data);
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
  }

  return success(updateRes.value);
} 
