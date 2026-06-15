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
// there is no error handling currently in this file.
// plan to add one, so that neat error messages can be given to srevice or any top layer.

interface TsUserCreateParams {
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
                    fileName: userParams.idCardImageFileName
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

    return success({
      id: tsUser.id,
      accountType: tsUser.accountType,
      salutation: tsUser.salutation,
      name: tsUser.name
    });
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

async function getTsUserBioById(id: number) {
  try{
    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id
      },
      include: {
        coreDetails: true,
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

    return success({
      salutaion: tsUser.coreDetails.salutation,
      name: tsUser.coreDetails.name,
      aicteNo: tsUser.aicteNo,
      annaUnivNo: tsUser.annaUnivNo,
      collegeName: tsUser.collegesWorked[0]?.collegeName,
      collegePlace: tsUser.collegesWorked[0]?.collegePlace,
      collegePinCode: tsUser.collegesWorked[0]?.collegePinCode,
      designation: tsUser.collegesWorked[0]?.designation,
      internal: tsUser.internal
    });
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getTsUserContactById(id: number) {
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
    const ag = await db.theoryHandled.aggregate({
      where: {
        userId: id
      },
      _max: {
        chosenTime: true
      }
    });
    const latestUpdatedTime = ag._max.chosenTime;

    if(latestUpdatedTime === null) {
      return [];
    }

    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id,
      },
      include: {
        theoriesHandled: {
          where: {
            chosenTime: {
              equals: latestUpdatedTime
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
    const ag = await db.practicalHandled.aggregate({
      where: {
        userId: id
      },
      _max: {
        chosenTime: true
      }
    });
    const latestUpdatedTime = ag._max.chosenTime;

    if(latestUpdatedTime === null) {
      return [];
    }

    const tsUser = await db.tsUser.findUniqueOrThrow({
      where: {
        userId: id,
      },
      include: {
        practicalsHandled: {
          where: {
            chosenTime: {
              equals: latestUpdatedTime
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

async function updateTheroyCourses(id: number, courses: {courseCode: string, courseTitle: string}[]) {
  try{
    const now = new Date();

    await db.$transaction(async tr => {
      await tr.tsUser.update({
        where: {
          userId: id
        },
        data: {
          coursesLastUpdated: new Date()
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
          coursesLastUpdated: new Date()
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
      }
    })

    return success({
      designation: workPlace.designation,
      collegeName: workPlace.collegeName,
      collegePlace: workPlace.collegePlace,
      collegePinCode: workPlace.collegePinCode,
    })

  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

export {
  createTsUser,
  getTsUserBioById,
  getTsUserContactById,
  getTsUserTheoryCourses,
  getTsUserPracticalCourses,
  updateTheroyCourses,
  updatePracticalCourses,
  updateTsContact,
  updateWorkPlace
}
