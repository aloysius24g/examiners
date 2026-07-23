import * as otpServices from '../services/otpService.js';
import {
  Body,
  Controller,
  Post,
  Route,
  SuccessResponse,
} from "tsoa";
import { InternalServerError } from '../utils/httpErrors.js';

@Route("verification")
export class VerificationController extends Controller {

  @Post("email")
  @SuccessResponse("200", "OTP sent")
  public async createOtp(
    @Body() body: {email: string},
  ): Promise<{message: string}> {

    const otpCreationResponse = await otpServices.sendOtp(body.email);

    if(! otpCreationResponse.success) {
      switch(otpCreationResponse.error.cause) {
        case 'DbError':
        case 'ValidationError':
        case 'BussinessConstraintViolation':
        case 'PermissionError':
        case 'AuthenticationError':
        case 'NotFoundError':
          throw new InternalServerError(otpCreationResponse.error.message);
      }
    }

    this.setStatus(200);

    return {message: 'Otp created.'}
  }
}
