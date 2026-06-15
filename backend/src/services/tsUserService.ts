import { isExistNotUsedIdCardImage } from "../dal/idCardImageDal.js"
import { createTsUser } from "../dal/tsUserDal.js";
import { error } from "../utils/result.js";

interface UserRegistrationDTO {
  name: string,
  email: string,
  passHash: string,
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
  internal: boolean,
  emailVerified: boolean,
  userVerified: boolean
} 
async function registerTsUser(params: UserRegistrationDTO) {
  try{
    const validIdCardImgae = await isExistNotUsedIdCardImage(params.idCardImageFileName);
  }catch(e) {

  }

  if(! validIdCardImgae) {
    return error({
      cause: '',
      message: 'Id card image file name is not valid'
    });
  }

  const u = await createTsUser()
  if(!u.success) {
    u.error.cause === 'K'
  }

}
