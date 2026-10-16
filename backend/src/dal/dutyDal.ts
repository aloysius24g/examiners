import { Sem } from '../../generated/prisma/enums.js';
import db from '../utils/database.js';
import prismaErrorAsValue from '../utils/prismaErrorAsValue.js';
import { success } from '../utils/result.js';

interface QPDuty {
  sem: Sem
  year: string
  courseCode: string
}

interface ScrutinyDuty {
  sem: Sem
  year: string
  questionCount: number
}

interface PracticalDuty {
  sem: Sem
  year: string
  courseCode: string
}

async function createQPSettingDuty(userId: number, qpDuty: QPDuty) {
  try {
    const duty = await db.qPSettingDuties.create({
      data: {
        userId: userId,
        ...qpDuty
      }
    });

    return success(duty);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function deleteQPSettingDuty(userId: number, dutyId: string) {
  try {
    const duty = await db.qPSettingDuties.delete({
      where: {
        userId: userId,
        id: dutyId
      }
    });

    return success(duty);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function createScrutinyDuty(userId: number, dutyAppointment: ScrutinyDuty) {
  try{
    const duty = await db.scrutinyDuties.create({
      data: {
        userId: userId,
        ...dutyAppointment
      }
    });

    return success(duty);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function deleteScrutinyDuty(userId: number, dutyId: string) {
  try {
    const duty = await db.scrutinyDuties.delete({
      where: {
        userId: userId,
        id: dutyId
      }
    });
    return success(duty);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function createPracticalDuty(userId: number, dutyAppointment: PracticalDuty) {
  try{
    const duty = await db.practicalDuties.create({
      data: {
        userId: userId,
        ...dutyAppointment
      }
    });

    return success(duty);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

async function deletePracticalDuty(userId: number, dutyId: string) {
  try {
    const duty = await db.practicalDuties.delete({
      where: {
        userId: userId,
        id: dutyId
      }
    });
    return success(duty);
  }catch(e) {
    return prismaErrorAsValue(e);
  }
}

const dutyDal = {
  createQPSettingDuty,
  deleteQPSettingDuty,
  createScrutinyDuty,
  deleteScrutinyDuty,
  createPracticalDuty,
  deletePracticalDuty
};

export default dutyDal;
