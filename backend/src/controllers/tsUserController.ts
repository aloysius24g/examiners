import { Body, Controller, Get, Path, Post, Query, Route } from "tsoa";
import { registerTsUser } from "../services/tsUserService.js";
import { ConflictError, InternalServerError, ValidationError } from "../utils/httpErrors.js";

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

export type TsUserDetailedDTO = Partial<{
  userVerified: boolean,
  emailVerified: boolean,
  phoneVerified: boolean,
  preferences: string[]
}> & TsUserRegistrationDTO & {
  internal: boolean,
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
          throw new ConflictError(creationResponse.error.message);
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
    @Path() id: string
  ): Promise<TsUserDetailedDTO> {
  }
}
