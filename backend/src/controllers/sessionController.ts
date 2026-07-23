import { Body, Controller, Post, Request, Route } from "tsoa";
import { login } from "../services/sessionService.js";
import { ConflictError, InternalServerError, UnauthorizedError, ValidationError } from "../utils/httpErrors.js";

export type CredentialDTO = {
    accountType: 'TS' | 'NS',
    userName?: string,
    email?: string,
    password: string
} 

export type SessionDTO = {
  id: number,
  salutation: string,
  name: string,
  accountType: string,
  roleName?: string
}

@Route('session')
export class SessionController extends Controller {

  @Post()
  public async createSession(
    @Body() credentials: CredentialDTO,
    @Request() req: any
  ): Promise<SessionDTO> {
    const loginResponse = await login(credentials)
    if(! loginResponse.success) {
      switch(loginResponse.error.cause) {
        case "DbError":
          throw new InternalServerError('cant login currently')
        case "ValidationError":
          throw new ValidationError(loginResponse.error.message)
        case "BussinessConstraintViolation":
          throw new ConflictError(loginResponse.error.message)
        case "NotFoundError":
        case "PermissionError":
        case "AuthenticationError":
          throw new UnauthorizedError(loginResponse.error.message) 
      }
    }

    req.res.cookie('refreshToken', loginResponse.value.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000
    })

    return {
      ...loginResponse.value.userContext
    }
  } 
} 
