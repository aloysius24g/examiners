import z from 'zod';

export const contextSchema = z.object({
  salutation: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"]),
  name: z.string(),
  id: z.number(),
  accountType: z.enum(['TS', 'NS'])
})
