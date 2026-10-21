import { Sem } from '../../generated/prisma/enums.js';
import db from '../utils/database.js';
import * as XLSX from "xlsx";

type ExaminerAppointment = {
  name: string,
  courses: string[]
}

async function getPracticalExaminerAppointments(year: string, sem: Sem): Promise<ExaminerAppointment[]> {
  const examinerPracticalData = await db.tsUser.findMany({
    include: {
      coreDetails: true,
      _count: {
        select: {
          practicalDuties: {
            where: {
              year: year,
              sem: sem
            }
          }
        }
      },
      practicalDuties: {
        where: {
          year: year,
          sem: sem,
        },
        select: {
          courseCode: true
        }
      }
    }
  });

  const examinersAndAppointments: ExaminerAppointment[] = [];

  for(let ex of examinerPracticalData) {
    if(ex._count.practicalDuties < 1) {
      continue;
    }

    const examinerAndAppointments: ExaminerAppointment = {
      name: ex.coreDetails.name,
      courses: ex.practicalDuties.map(d => d.courseCode)
    };

    examinersAndAppointments.push(examinerAndAppointments)
  }

  return examinersAndAppointments;
}

export function generateExcelFile(
  data: Record<string, string>[],
  fileName: string
) {

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
}

// should modify the const for the particular exam
async function run() {
  const year = '2026';
  const sem = 'odd';
  const reportFilePath = './report.xlsx';

  const examinersAndAppointments = await getPracticalExaminerAppointments(year, sem);

  const data = examinersAndAppointments.map(ea => ({
    name: ea.name,
    course: ea.courses.join(', ')
  }))

  generateExcelFile(data, reportFilePath);

}

run()
