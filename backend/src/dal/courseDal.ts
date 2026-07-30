import { success } from "../utils/result.js";
import { readFileSync } from 'fs';
import * as XLSX from "xlsx";
import z from 'zod';

const workBookBuf = readFileSync('courses-available.xlsx');
const workBook = XLSX.read(workBookBuf);

if(! workBook) {
  throw new Error('courses-availabel file not found. Name it correctly');
}

const sheet = workBook.Sheets['courses-available'];

if(! sheet) {
  throw new Error('sheet named courses-available is not found.');
}

const coursesAvailable = XLSX.utils.sheet_to_json(sheet);

const s = z.array(z.object({
  courseCode: z.coerce.string(),
  courseTitle: z.coerce.string(),
  type: z.enum(['theory', 'practical']),
}));

const safeCoursesAvailable = s.parse(coursesAvailable);

//export const availableCourses = [
//  {
//    courseCode: 'ME22202',
//    courseTitle: 'Engineering Mechanics',
//    type: 'theory',
//  },
//  {
//    courseCode: 'AD22201',
//    courseTitle: 'Introduction to Artificial Intelligence and Date Science',
//    type: 'theory',
//  },
//  {
//    courseCode: 'EC22301',
//    courseTitle: 'Bacic Electronics',
//    type: 'theory',
//  },
//  {
//    courseCode: 'EE22304',
//    courseTitle: 'Electromagnetic Waves',
//    type: 'theory',
//  },
//  {
//    courseCode: 'CE22501',
//    courseTitle: 'Design of Steel Structures',
//    type: 'theory',
//  },
//  {
//    courseCode: 'CS22501',
//    courseTitle: 'Full Stact Web Development',
//    type: 'theory',
//  },
//  {
//    courseCode: 'ME22802',
//    courseTitle: 'Mechanical practi 1 ',
//    type: 'practical',
//  },
//  {
//    courseCode: 'AD22801',
//    courseTitle: 'AIDS Practiacl',
//    type: 'practical',
//  },
//  {
//    courseCode: 'EC22801',
//    courseTitle: 'ECE practical',
//    type: 'practical',
//  },
//  {
//    courseCode: 'EE22804',
//    courseTitle: 'Instrumentaion practical',
//    type: 'practical',
//  },
//  {
//    courseCode: 'CE22801',
//    courseTitle: 'civil lab',
//    type: 'practical',
//  },
//
//] as const satisfies {
//  courseCode: string
//  courseTitle: string,
//  type: 'theory' | 'practical'
//}[]

export async function getTheoryCourses() {
  return success(safeCoursesAvailable.filter(el => el.type === 'theory'));
}

export async function getPracticalCourses() {
  return success(safeCoursesAvailable.filter(el => el.type === 'practical'));
}
