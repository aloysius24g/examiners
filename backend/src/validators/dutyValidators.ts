import z from 'zod';

export const qpSettingDutySchema = z.object({
  sem: z.enum(['odd', 'even'], `semester cycle should either be 'odd' or 'even'`),
  year: z.string().regex(/[0-9]{4}/, 'year should be 4 digit.'),
  courseCode: z.string().length(7, 'course code should be 7 character long.')
})
