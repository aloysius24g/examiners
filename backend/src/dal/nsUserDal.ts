import db from '../utils/database.js';
import prismaErrorAsValue from '../utils/prismaErrorAsValue.js';
import { success } from '../utils/result.js';

interface NsUserCreationParams {
  name: string,
  saluation: string,
  userName: string,
  passHash: string,
  roleName: string
}

async function createNsUser(userParams: NsUserCreationParams) {
  try{
    const user = await db.nsUser.create({
      data: {
        roleName: userParams.roleName,
        userName: userParams.userName,
        coreDetails: {
          create: {
            name: userParams.name,
            accountType: 'NS',
            salutation: userParams.saluation,
            passHash: userParams.passHash,
          }
        }
      },
      include: {
        coreDetails: true
      }
    })
    return success(user);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getNsUserByUserName(userName: string) {
  try{
    const user = await db.nsUser.findUniqueOrThrow({
      where: {
        userName: userName,
        coreDetails: {
          is: {
            accountType: 'NS',
          }
        }
      },
      include: {
        coreDetails: true
      }
    })
    return success(user)
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function getNsUserById(id: number) {
  try{
    const user = await db.nsUser.findUniqueOrThrow({
      where: {
        userId: id,
        coreDetails: {
          is: {
            accountType: 'NS',
          }
        }
      },
      include: {
        coreDetails: true
      }
    })
    return success(user)
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

export async function markIsActive(id: number, active: boolean) {
  try{
    await db.nsUser.update({
      where: {
        userId: id
      },
      data: {
        coreDetails: {
          update: {
            active: active
          }
        }
      },
      include: {
        coreDetails: true
      }
    });
    return success(active);
  } catch(e) {
    return prismaErrorAsValue(e);
  }
}

export {
  createNsUser,
  getNsUserByUserName,
  getNsUserById
}
