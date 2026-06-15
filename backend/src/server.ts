import { createIdCardImage, isExistNotUsedIdCardImage } from "./dal/idCardImageDal.js";
import { createTsUser, getTsUserPracticalCourses, getTsUserTheoryCourses, updatePracticalCourses, updateTheroyCourses, updateTsContact } from "./dal/tsUserDal.js"

async function run() {
  //await createIdCardImage('lol1.png');
  //const res = await isExistNotUsedIdCardImage('lol1.png')
  //console.log(res, 'image not referenced')
  //await updateTsContact(10, {
  //  phone: '8399213960',
  //  email: 'na@nananan.edu.bu'

  //})
  //await updatePracticalCourses(10, [
  //  {
  //    courseCode: 'KE22',
  //    courseTitle: 'Farming'
  //  },
  //  {
  //    courseCode: 'HE3321',
  //    courseTitle: 'dkd pra'
  //  }
  //])
  const c = await getTsUserPracticalCourses(11)
  console.log(c)

  //await createTsUser({
  //  aicteNo: '1-1283434001',
  //  annaUnivNo: '128374827482',
  //  collegeName: 'Narayana guru college',
  //  collegePlace: 'Nagercoil',
  //  collegePinCode: '629009',
  //  department: 'ECE',
  //  designation: 'Assistant Professor',
  //  email: 'b@na.edu.in',
  //  phone: '293874192',
  //  internal: false,
  //  emailVerified: true,
  //  passHash: 'j38a7j38a7j38a7j38a7j38a7j38a7j38a7j38a7j38a7j38a7j38a7j38a7',
  //  idCardImageFileName: 'lol.png',
  //  salutation: 'Dr',
  //  name: 'kumar',
  //  userVerified: false,
  //  yearOfExperience: 5
  //});
}

run()
