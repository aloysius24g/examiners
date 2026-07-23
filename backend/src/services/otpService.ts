import { google } from "googleapis";
import ENV from "../utils/envProvider.js";
import { randomInt } from "node:crypto";
import * as otpDal from '../dal/otpDal.js';
import { success, error, Result } from "../utils/result.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import z from "zod";

const oauth2Client = new google.auth.OAuth2(
  ENV.GOOGLE_CLIENT_ID,
  ENV.GOOGLE_CLIENT_SECRET,
  ENV.GOOGLE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: ENV.GOOGLE_OAUTH_REFRESH_TOKEN,
});

const gmailClient = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

export async function sendOtp(email: string): Promise<Result<void, ServiceError>> {

  const safeParams = z.email().safeParse(email);
  if(! safeParams.success) {
    return error({
      cause: 'ValidationError',
      message: 'Invalid email.'
    });
  }

  // if already has unexpired otp, just return
  const alreadyOtp = await otpDal.getOtpByEmail(email);
  if(alreadyOtp !== undefined) {
    return success(undefined);
  }

  const otp = generateOtp();

  const rawMessage = [
    `To: ${safeParams.data}`,
    "Subject: Your OTP Code",
    "",
    `Your OTP for SXCCE examiners portal is ${otp}`,
  ].join("\n");

  const encodedMessage = Buffer.from(rawMessage)
  .toString("base64url");

  try{
    await gmailClient.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });
  }catch(e) {
    console.log(e)
    //TODO
    //this may fail be multiple cases
    //like my ref token may expire
    //networking issues,
    //rejected email
    //currently treating all of these as internal networking error
    //also i dont have a generic error type in serviceErros to handle unexpected errors(maybe that is unnecessarr.)
    //:(
    return error({
      cause: 'DbError',
      message: 'Cannot sent otp currently.'
    })
  }

  // put it in dal
  await otpDal.setOtpByEmail(email, otp);

  return success(undefined);
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<Result<void, ServiceError>> {

  let correctOtp;
  try{
    correctOtp = await otpDal.getOtpByEmail(email);
  }catch(e) {
    return error({
      cause: 'DbError',
      message: 'cannot verify otp.'
    });
  }

  if(correctOtp === undefined) {
    return error({
      cause: 'AuthenticationError',
      message: 'Otp expired generate a new one.'
    });
  }

  if(otp !== correctOtp) {
    return error({
      cause: 'AuthenticationError',
      message: 'Incorrect otp.'
    });
  };
  //await otpDal.invalidateOtp(email);

  return success(undefined);
}

export async function invalidateOtp(email: string) {
  await otpDal.invalidateOtp(email);
}

// itha enga poda ):
function generateOtp() {
  return randomInt(100000, 999999).toString().padStart(6, '0');
}
