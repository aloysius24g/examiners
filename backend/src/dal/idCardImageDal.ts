import db from '../utils/database.js';
import prismaErrorAsValue from '../utils/prismaErrorAsValue.js';
import { success } from '../utils/result.js';

async function createIdCardImage(fileName: string) {
  try{
    await db.idCardImage.create({
      data: {
        fileName: fileName
      }
    });
    return success(fileName);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function isExistNotUsedIdCardImage(fileName: string) {
  try{
    const idCardImage = await db.idCardImage.findUnique({
      where: {
        fileName: fileName,
        forFacultyProof: {
          is: null
        }
      }
    });

    return success(idCardImage !== null);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

export {
  createIdCardImage,
  isExistNotUsedIdCardImage
}
