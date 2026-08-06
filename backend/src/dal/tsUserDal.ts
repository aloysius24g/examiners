import { AccountType, ExaminerRole } from '../../generated/prisma/enums.js';
import db from '../utils/database.js';
import prismaErrorAsValue from '../utils/prismaErrorAsValue.js';
import { success } from '../utils/result.js';
// create ts user
// get user with email
// get and set contact
// get and set:
// handled theory course
// handled practical course

// TODO
// make the type of each dal function neat, so that it displayes like resutl<returntype>
// now its clunky, but still works. go ahead and come again after becomming a ts jod.

interface TsUserCreateParams {
  name: string,
  email: string,
  passHash: string,
  salutation: string,
  phone: string,
  aicteNo: string | null,
  annaUnivNo: string | null,
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

async function createTsUser(userParams: TsUserCreateParams) {
  try {
    const tsUser = await db.user.create({
      data: {
        salutation: userParams.salutation,
        name: userParams.name,
        passHash: userParams.passHash,
        accountType: 'TS',
        tsDetails: {
          create: {
            aicteNo: userParams.aicteNo,
            annaUnivNo: userParams.annaUnivNo,
            yearOfExperience: userParams.yearOfExperience,
            department: userParams.department,
            collegesWorked: {
              create: {
                designation: userParams.designation,
                collegePinCode: userParams.collegePinCode,
                collegePlace: userParams.collegePlace,
                collegeName: userParams.collegeName,
                idCardImage: {
                  connect: {
                    fileName: userParams.idCardImageFileName,
                  }
                }
              },
            },
            internal: userParams.internal,
            emailVerified: userParams.emailVerified,
            userVerified: userParams.userVerified,
            email: userParams.email,
            phone: userParams.phone,
          }
        }
      }
    });

    return success(tsUser);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

interface TsUserContactUpdateParams {
  email: string,
  phone: string,
}

async function updateTsContact(id: number, updateParams: TsUserContactUpdateParams) {
  try {
    const tsUser = await db.tsUser.update({
      where: {
        userId: id
      },
      data: {
        email: updateParams.email,
        phone: updateParams.phone
      }
    });

    return success({
      email: tsUser.email,
      phone: tsUser.phone
    })
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserBio(id: number) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id
      },
      include: {
        coreDetails: true,
        preferences: true,
        collegesWorked: {
          orderBy: {
            recordedAt: "desc"
          },
          take: 1
        }
      }
    }); 

    // todo
    // check the collage details is not null.
    // do this after planing a well error handling machanism

    if(tsUser.collegesWorked[0] === undefined) {
      throw new Error('TsUser entity with no CollegeWorked Record'); // ithu nadaka vaipu illa.
    }

    return success({
      salutaion: tsUser.coreDetails.salutation,
      name: tsUser.coreDetails.name,
      aicteNo: tsUser.aicteNo,
      annaUnivNo: tsUser.annaUnivNo,
      collegeName: tsUser.collegesWorked[0]?.collegeName,
      collegePlace: tsUser.collegesWorked[0]?.collegePlace,
      collegePinCode: tsUser.collegesWorked[0]?.collegePinCode,
      idCardImageFileName: tsUser.collegesWorked[0].idCardImageFileName,
      department: tsUser.department,
      designation: tsUser.collegesWorked[0]?.designation,
      yearOfExperience: tsUser.yearOfExperience,
      internal: tsUser.internal,
      userVerified: tsUser.userVerified,
      userBlacklisted: tsUser.userBlacklisted,
      theoryCoursesLastUpdated: tsUser.theoryCoursesLastUpdated,
      practicalCoursesLastUpdated: tsUser.practicalCoursesLastUpdated,
      preferredFor: tsUser.preferences.map(p => p.preferredFor),
    });
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserUsingAicteNo(aicteNo: string) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        aicteNo: aicteNo
      },
      include: {
        coreDetails: true
      }
    });
    return success(tsUser);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserUsingAnnaUnivNo(annaUnivNo: string) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        annaUnivNo: annaUnivNo
      },
      include: {
        coreDetails: true
      }
    });
    return success(tsUser);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserUsingEmail(email: string) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        email: email
      },
      include: {
        coreDetails: true
      }
    });
    return success(tsUser);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserUsingPhone(phone: string) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        phone: phone
      },
      include: {
        coreDetails: true
      }
    });
    return success(tsUser);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserContact(id: number) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id
      },
    })

    return success({
      email: tsUser.email,
      phone: tsUser.phone
    });

  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserTheoryCourses(id: number) {
  try{
    const { theoryCoursesLastUpdated }  = await db.tsUser.findFirstOrThrow({
      where: {
        userId: id
      },
      select: {
        theoryCoursesLastUpdated: true
      }
    });

    if(theoryCoursesLastUpdated === null) {
      return success([]);
    }

    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id,
      },
      include: {
        theoriesHandled: {
          where: {
            chosenTime: {
              equals: theoryCoursesLastUpdated
            }
          }
        }
      }
    });

    const theories: {
      courseCode: string,
      courseTitle: string
    }[] = [];


    tsUser.theoriesHandled.forEach(th => {
      theories.push({courseCode: th.courseCode, courseTitle: th.courseTitle});
    })

    return success(theories);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserPracticalCourses(id: number) {
  try{
    const { practicalCoursesLastUpdated } = await db.tsUser.findFirstOrThrow({
      where: {
        userId: id
      },
      select: {
        practicalCoursesLastUpdated: true
      }
    })

    if( practicalCoursesLastUpdated === null) {
      return success([]);
    }

    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id,
      },
      include: {
        practicalsHandled: {
          where: {
            chosenTime: {
              equals: practicalCoursesLastUpdated
            }
          }
        }
      }
    });

    const practicals: {courseCode: string, courseTitle: string}[] = [];

    tsUser.practicalsHandled.forEach(th => {
      practicals.push({courseCode: th.courseCode, courseTitle: th.courseTitle});
    })

    return success(practicals);
  }catch(e) {
    return prismaErrorAsValue(e)
  }
}

async function updateTheoryCourses(id: number, courses: {courseCode: string, courseTitle: string}[]) {
  try{
    const now = new Date();

    await db.$transaction(async tr => {
      await tr.tsUser.update({
        where: {
          userId: id
        },
        data: {
          theoryCoursesLastUpdated: now
        }
      });

      await tr.theoryHandled.createMany({
        data: courses.map( c => {
          return {
            userId: id,
            courseCode: c.courseCode, 
            courseTitle: c.courseTitle,
            chosenTime: now
          }
        })
      })
    });

    return success(courses.map(c => ({courseCode: c.courseCode, courseTitle: c.courseTitle}))); 
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function updatePracticalCourses(id: number, courses: {courseCode: string, courseTitle: string}[]) {
  try{
    const now = new Date();

    await db.$transaction(async tr => {
      await tr.tsUser.update({
        where: {
          userId: id
        },
        data: {
          practicalCoursesLastUpdated: now
        }
      });

      await tr.practicalHandled.createMany({
        data: courses.map( c => {
          return {
            userId: id,
            courseCode: c.courseCode, 
            courseTitle: c.courseTitle,
            chosenTime: now
          }
        })
      })
    })

    return success(courses.map(c => ({courseCode: c.courseCode, courseTitle: c.courseTitle}))); 

  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

interface createWorkPlaceParams {
  designation: string,
  collegeName: string,
  collegePlace: string,
  collegePinCode: string,
  idCardImageFileName: string
}

async function updateWorkPlace(id: number, workPlaceParams: createWorkPlaceParams) {
  try{
    const workPlace = await db.collegeWorked.create({
      data: {
        collegeName: workPlaceParams.collegeName,
        collegePlace: workPlaceParams.collegePlace,
        collegePinCode: workPlaceParams.collegePinCode,
        designation: workPlaceParams.designation,
        idCardImage: {
          connect: {
            fileName: workPlaceParams.idCardImageFileName
          }
        },
        tsUser: {
          connect: {
            userId: id
          }
        }
      },
      include: {
        tsUser: true
      }
    })

    return success({
      designation: workPlace.designation,
      collegeName: workPlace.collegeName,
      collegePlace: workPlace.collegePlace,
      collegePinCode: workPlace.collegePinCode,
      idCardImageFileName: workPlace.idCardImageFileName,
    })

  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

interface UpdatePersonalInfoParams {
  aicteNo: string | null,
  annaUnivNo: string |null,
  yearOfExperience: number
}

export async function updatePersonalInformation(id: number, params: UpdatePersonalInfoParams) {
  try{
    await db.tsUser.update({
      where: {
        userId: id
      },
      data: {
        aicteNo: params.aicteNo,
        annaUnivNo: params.annaUnivNo,
        yearOfExperience: params.yearOfExperience
      }
    });

    return success({
      aicteNo: params.aicteNo,
      annaUnivNo: params.annaUnivNo,
      yearOfExperience: params.yearOfExperience
    })
  }catch(e) {
    return prismaErrorAsValue(e)
  }
}

export async function updatePreferences(id: number, prefs: ExaminerRole[]) {

  try{
    await db.$transaction(async tr => {
      await tr.preference.deleteMany({
        where: {
          userId: id
        }
      });

      await tr.preference.createMany({
        data: prefs.map( p=> {
          return {
            userId: id,
            preferredFor: p,
          }
        })
      })
    });

    return success(prefs); 
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

export async function markIsVerified(id: number, verified: boolean) {
  try{
    await db.tsUser.update({
      where: {
        userId: id
      },
      data: {
        userVerified: verified
      }
    });

    return success(verified);
  } catch(e) {
    return prismaErrorAsValue(e);
  }
}

export async function updateBlackListed(id: number, blacklisted: boolean) {
  try{
    await db.tsUser.update({
      where: {
        userId: id
      },
      data: {
        userBlacklisted: blacklisted
      }
    });

    return success(blacklisted);
  } catch(e) {
    return prismaErrorAsValue(e);
  }
}

export async function updatePassHash(email: string, newPassHash: string) {
  try{
    await db.tsUser.update({
      where: {
        email: email,
        coreDetails: {
          accountType: 'TS'
        }
      },
      data: {
        coreDetails: {
          update: {
            passHash: newPassHash
          }
        }
      }
    });

    return success(undefined);
  } catch(e) {
    return prismaErrorAsValue(e);
  }
}


export async function getTsUsers() {
  try{
    const tsUsers = await db.tsUser.findMany({
      include: {
        practicalsHandled: true,
        theoriesHandled: true,
        coreDetails: true,
        preferences: true,
        collegesWorked: {
          orderBy: {
            recordedAt: 'desc',
          },
          take: 1
        }
      }
    });
    return success(tsUsers);
  } catch(e) {
    return prismaErrorAsValue(e);
  }
}

export {
  createTsUser,
  getTsUserBio,
  getTsUserContact,
  getTsUserTheoryCourses,
  getTsUserPracticalCourses,
  getTsUserUsingAicteNo,
  getTsUserUsingAnnaUnivNo,
  getTsUserUsingEmail,
  getTsUserUsingPhone,
  updateTheoryCourses,
  updatePracticalCourses,
  updateTsContact,
  updateWorkPlace,
}
