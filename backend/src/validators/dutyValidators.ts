import z from 'zod';

export const qpSettingDutySchema = z.object({
  sem: z.enum(['odd', 'even'], `semester cycle should either be 'odd' or 'even'`),
  year: z.string().regex(/[0-9]{4}/, 'year should be 4 digit.'),
  courseCode: z.string().trim().nonempty('course code should not be empty.').max(10, 'course code should not exceed 10 characters.')
})

export const scrutinyDutySchema = z.object({
  sem: z.enum(['odd', 'even'], `semester cycle should either be 'odd' or 'even'`),
  year: z.string().regex(/[0-9]{4}/, 'year should be 4 digit.'),
  questionCount: z.number().min(1, 'minimum of 1 question should be assigned in an scrutiny appointment.')
})

export const practicalDutySchema = qpSettingDutySchema; // same thing.
