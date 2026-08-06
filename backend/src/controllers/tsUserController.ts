import { Body, Controller, Get, Path, Post, Put, Route } from "tsoa";
import * as tsUserService from "../services/tsUserService.js";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from "../utils/httpErrors.js";
import { CourseDTO } from "./courseController.js";

export interface TsUserRegistrationDTO {
  name: string,
  email: string,
  otp: string,
  password: string,
  salutation: string,
  phone: string,
  aicteNo: string | null,
  annaUnivNo: string | null,
  yearOfExperience: number,
  collegeName: string,
  collegePlace: string,
  collegePinCode: string,
  idCardImageFileName: string,
  department: string,
  designation: string,
} 

export interface TsUserMinimalDTO {
  salutation: string,
  name: string,
  id: number,
  accountType: string
}

type TsUserInternalFields = {
  userVerified: boolean,
  userBlacklisted: boolean,
  emailVerified: boolean,
  phoneVerified: boolean,
  preferences: string[]
}

export type TsUserDetailedDTO = 
  Partial<TsUserInternalFields>
  & {
    bio: {
      name: string,
      salutation: string,
      aicteNo: string | null,
      annaUnivNo: string | null,
      yearOfExperience: number,
      department: string,
    },
    workPlace: {
      internal: boolean,
      designation: string,
      collegeName: string,
      collegePlace: string,
      collegePinCode: string,
      idCardImageFileName: string,
    },
    contact: {
      email: string,
      phone: string,
    },
    theoryHandled: CourseDTO[],
    practicalHandled: CourseDTO[],
    theoryCoursesLastUpdated: string | null,
    practicalCoursesLastUpdated: string | null
  }

export type TsUserListDTO = Omit<
  (TsUserDetailedDTO & {id: number})
  , "theoryCoursesLastUpdated" | "practicalCoursesLastUpdated"
>[]

export type WorkPlaceDTO = {
  designation: string,
  collegeName: string,
  collegePlace: string,
  collegePinCode: string,
  idCardImageFileName: string
}

export type ContactDTO = {
  email: string,
  phone: string
}

export type UpdatablePersonalInfoDTO = {
  aicteNo: string | null,
  annaUnivNo: string |null,
  yearOfExperience: number
}

export type PasswordResetDTO = {
  email: string,
  newPassword: string,
  otp: string
}

export type TsUserQuery = {
  filterField: 
      'name' 
      | 'theory-handled'
      | 'practical-handled'
      | 'preference',
  filterValue: string
}

export type ContactDTOWithOTP = ContactDTO & {otp: string}

@Route("examiners")
export class TsUserController extends Controller {

  @Post()
  public async createExaminer(
    @Body() user: TsUserRegistrationDTO
  ): Promise<TsUserMinimalDTO> {
    const creationResponse = await tsUserService.registerTsUser(user);

    if(! creationResponse.success) {
      switch(creationResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(creationResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(creationResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(creationResponse.error.message);
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(creationResponse.error.message);
      }
    }

    return creationResponse.value;
  }

  @Get()
  public async getExaminers(
    //TODO 
    //@Queries() queries?: TsUserQuery
  ): Promise<TsUserListDTO> {
    const res = await tsUserService.getTsUsers();
    if(! res.success) {
      switch(res.error.cause) {
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(res.error.message);
        case "NotFoundError":
          throw new NotFoundError(res.error.message);
        case "ValidationError":
        case "BussinessConstraintViolation":
        case "DbError":
          throw new InternalServerError(res.error.message);
      }
    }
    return res.value;
  } 

  @Get('{id}')
  public async getExaminerById(
    @Path() id: number
  ): Promise<TsUserDetailedDTO> {

    const tsUserResponse = await tsUserService.getTsUser(id);  

    if(! tsUserResponse.success) {
      switch(tsUserResponse.error.cause) {
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(tsUserResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(tsUserResponse.error.message);
        case "ValidationError":
        case "BussinessConstraintViolation":
        case "DbError":
          throw new InternalServerError(tsUserResponse.error.message);
      }
    }

    return tsUserResponse.value;
  }

//  @Put('{id}/workplace/') 
//  public async updateContact(
//    @Path() id: number,
//  ): Promise<WorkPlaceDTO> {
//  }
//
//  @Put('{id}/contact/') 
//  public async updateContact(
//    @Path() id: number,
//  ): Promise<ContactDTO> {
//  }
//
//  @Put('{id}/theroyHandled/') 
//  public async updateContact(
//    @Path() id: number,
//  ): Promise<CourseDTO[]> {
//  }
//
//  @Put('{id}/practicalHandled/') 
//  public async updateContact(
//    @Path() id: number,
//  ): Promise<CourseDTO[]> {
//  }
  @Put('{id}/workplace/')
  public async updateWorkPlace(
    @Path() id: number,
    @Body() workPlace: WorkPlaceDTO,
  ): Promise<WorkPlaceDTO> {
    const updateResponse = await tsUserService.updateWorkPlace(id, workPlace);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
          case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return updateResponse.value;
  }

  @Put('{id}/contact/')
  public async updateContact(
    @Path() id: number,
    @Body() contact: ContactDTOWithOTP,
  ): Promise<ContactDTO> {
    const updateResponse = await tsUserService.updateContact(id, contact);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
          case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return updateResponse.value;
  }

  @Put('{id}/theoryHandled/')
  public async updateTheoryHandled(
    @Path() id: number,
    @Body() courses: CourseDTO[],
  ): Promise<CourseDTO[]> {
    const updateResponse = await tsUserService.updateCoursesHandled('therory' , id, courses);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return updateResponse.value;
  }

  @Put('{id}/practicalHandled/')
  public async updatePracticalHandled(
    @Path() id: number,
    @Body() courses: CourseDTO[],
  ): Promise<CourseDTO[]> {
    const updateResponse = await tsUserService.updateCoursesHandled('practical' , id, courses);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
          case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return updateResponse.value;
  }

  @Put('{id}/blacklisted/')
  public async updateBlacklisted(
    @Path() id: number,
    @Body() body: {userBlacklisted: boolean},
  ): Promise<{userBlacklisted: boolean}> {

    const updateResponse = await tsUserService.updateIsBlacklisted(id, body.userBlacklisted);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
          case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return {
      userBlacklisted: updateResponse.value
    }
  }

  @Put('{id}/verified/')
  public async updateVerified(
    @Path() id: number,
    @Body() body: {userVerified: boolean},
  ): Promise<{userVerified: boolean}> {

    const updateResponse = await tsUserService.updateIsVerified(id, body.userVerified);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
          case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return {
      userVerified: updateResponse.value
    }
  }

  @Put('{id}/preferences/')
  public async updatePreferences(
    @Path() id: number,
    @Body() body: {preferences: string[]},
  ): Promise<{preferences: string[]}> {

    const updateResponse = await tsUserService.updatePreferences(id, body.preferences);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
          case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return {
      preferences: updateResponse.value
    }
  }

  @Put('{id}/personal/')
  public async updatePersonalInformation(
    @Path() id: number,
    @Body() body: UpdatablePersonalInfoDTO,
  ): Promise<UpdatablePersonalInfoDTO> {

    const updateResponse = await tsUserService.updatePersonalInformation(id, body);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return updateResponse.value;
  }

  @Put('/passwords') // kind of violated rest standard's basics here. but ok works fine.
  public async updatePassword(
    @Body() body: PasswordResetDTO,
  ): Promise<void> {

    const updateResponse = await tsUserService.updatePassword(body);

    if (!updateResponse.success) {
      switch (updateResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(updateResponse.error.message);
        case "BussinessConstraintViolation":
          throw new ConflictError(updateResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(updateResponse.error.message);
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(updateResponse.error.message);
      }
    }

    return undefined;
  }
}
