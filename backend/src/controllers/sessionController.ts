import { Body, Controller, Post, Request, Res, Route } from "tsoa";
import { login } from "../services/sessionService.js";
import { ConflictError, InternalServerError, UnauthorizedError, ValidationError } from "../utils/httpErrors.js";

export type credentialDTO = {
    accountType: 'TS' | 'NS',
    userName?: string,
    email?: string,
    password: string
} 

@Route('session')
export class SessionController extends Controller {

  @Post()
  public async createSession(
    @Body() credentials: credentialDTO,
    @Request() req: any
  ): Promise<{message: string}> {
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
        case "WrongCredentials":
          throw new UnauthorizedError(loginResponse.error.message) 
      }
    }

    req.res.cookie('refreshToken', loginResponse.value, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    return {
      message: 'session created successfully.'
    }
  } 
} 
