import { Body, Controller, Get, Path, Post, Put, Route } from "tsoa";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from "../utils/httpErrors.js";
import * as nsUserService from "../services/nsUserServices.js";

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
  accountType: string,
  roleName: string
}

export type NsUserDetailedDTO = Omit<NsUserRegistrationDTO, 'password'> 

@Route("officers")
export class NsUserController extends Controller {

  @Post()
  public async createOfficer(
    @Body() user: NsUserRegistrationDTO
  ): Promise<NsUserMinimalDTO> {
    const creationResponse = await nsUserService.registerNsUser(user);

    if(! creationResponse.success) {
      switch(creationResponse.error.cause) {
        case "DbError":
          throw new InternalServerError();
        case "ValidationError":
          throw new ValidationError(creationResponse.error.message);
        case "BussinessConstraintViolation":
        case "PermissionError":
        case "AuthenticationError":
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
  public async getOfficerById(
    @Path() id: number
  ): Promise<NsUserDetailedDTO> {

    const nsUserResponse = await nsUserService.getNsUser(id);  

    if(! nsUserResponse.success) {
      switch(nsUserResponse.error.cause) {
        case "PermissionError":
        case "AuthenticationError":
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

  @Put('{id}/active')
  public async putOfficerActiveStatus(
    @Path() id: number,
    @Body() active: boolean 
  ): Promise<boolean> {
    const updateRes = await nsUserService.updateActiveStatus(id, active); 

    if(! updateRes.success) {
      switch(updateRes.error.cause) {
        case "DbError":
        case "ValidationError":
        case "BussinessConstraintViolation":
        case "NotFoundError":
          throw new InternalServerError(updateRes.error.message);
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(updateRes.error.message);
      }
    }

    return updateRes.value;
  }
}
