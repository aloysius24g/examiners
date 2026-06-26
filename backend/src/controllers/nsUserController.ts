import { Body, Controller, Get, Path, Post, Route } from "tsoa";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from "../utils/httpErrors.js";
import { getNsUser, registerNsUser } from "../services/nsUserServices.js";

export interface NsUserRegistrationDTO {
  userName: string,
  name: string,
  password: string,
  salutation: string,
  roleName: string
} 

export interface NsUserMinimalDTO {
  salutation: string,
  name: string,
  id: number,
  accountType: string
}

export type NsUserDetailedDTO = Omit<NsUserRegistrationDTO, 'password'> 

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

// invalid belofw

@Route("officers")
export class TsUserController extends Controller {

  @Post()
  public async createOfficer(
    @Body() user: NsUserRegistrationDTO
  ): Promise<NsUserMinimalDTO> {
    const creationResponse = await registerNsUser(user);

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
  public async getOfficers(
  ): Promise<void> {
  } 

  @Get('{id}')
  public async getOficerById(
    @Path() id: number
  ): Promise<NsUserDetailedDTO> {

    const nsUserResponse = await getNsUser(id);  

    if(! nsUserResponse.success) {
      switch(nsUserResponse.error.cause) {
        case "PermissionError":
          throw new UnauthorizedError(nsUserResponse.error.message);
        case "NotFoundError":
          throw new NotFoundError(nsUserResponse.error.message);
        case "ValidationError":
        case "BussinessConstraintViolation":
        case "DbError":
          throw new InternalServerError(nsUserResponse.error.message);
      }
    }

    return nsUserResponse.value;
  }
}
