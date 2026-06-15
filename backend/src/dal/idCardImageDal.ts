import db from '../utils/database.js';

async function createIdCardImage(fileName: string) {
  await db.idCardImage.create({
    data: {
      fileName: fileName
    }
  });
  return fileName;
}

async function isExistNotUsedIdCardImage(fileName: string) {
  const idCardImage = await db.idCardImage.findUnique({
    where: {
      fileName: fileName,
      forFacultyProof: {
        is: null
      }
    }
  });

  return idCardImage !== null;
}

export {
  createIdCardImage,
  isExistNotUsedIdCardImage
}
