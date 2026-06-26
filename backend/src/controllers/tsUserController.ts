import { Body, Controller, Get, Path, Post, Put, Query, Route } from "tsoa";
import { getTsUser, registerTsUser } from "../services/tsUserService.js";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from "../utils/httpErrors.js";
import { CourseDTO } from "./courseController.js";

export interface TsUserRegistrationDTO {
  name: string,
  email: string,
  password: string,
  salutation: string,
  phone: string,
  aicteNo: string,
  annaUnivNo: string,
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
  emailVerified: boolean,
  phoneVerified: boolean,
  idCardImageFileName: string,
  preferences: string[]
}

export type TsUserDetailedDTO = 
  Partial<TsUserInternalFields>
  & {
    bio: {
      name: string,
      salutation: string,
      aicteNo: string,
      annaUnivNo: string,
      yearOfExperience: number,
    },
    workPlace: {
      internal: boolean,
      department: string,
      designation: string,
      collegeName: string,
      collegePlace: string,
      collegePinCode: string,
    },
    contact: {
      email: string,
      phone: string,
    },
    theoryHandled: CourseDTO[],
    practicalHandled: CourseDTO[]
  }

export type WorkPlaceDTO = {
  internal: boolean,
  department: string,
  designation: string,
  collegeName: string,
  collegePlace: string,
  collegePinCode: string,
}

export type ContactDTO = {
  email: string,
  phone: string
}

@Route("examiners")
export class TsUserController extends Controller {

  @Post()
  public async createExaminer(
    @Body() user: TsUserRegistrationDTO
  ): Promise<TsUserMinimalDTO> {
    const creationResponse = await registerTsUser(user);

    if(! creationResponse.success) {
      switch(creationResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(creationResponse.error.message);
        case "BussinessConstraintViolation":
        case "PermissionError":
          throw new ConflictError(creationResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(creationResponse.error.message);
      }
    }

    return creationResponse.value;
  }

  @Get()
  public async getExaminers(
    @Query('filter-by') filterBy?:
      'name' 
      | 'college-name'
      | 'theory-handled'
      | 'practical-handled'
      | 'preference',
    @Query('filter-value') filterValue?: string,
    @Query('page') page?: number
  ): Promise<void> {
  } 

  @Get('{id}')
  public async getExaminerById(
    @Path() id: number
  ): Promise<TsUserDetailedDTO> {

    const tsUserResponse = await getTsUser(id);  

    if(! tsUserResponse.success) {
      switch(tsUserResponse.error.cause) {
        case "PermissionError":
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
}
