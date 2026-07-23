import z from 'zod';

export const contextSchema = z.object({
  salutation: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"], 'Invalid Salutation.'),
  name: z.string(),
  id: z.number(),
  accountType: z.enum(['TS', 'NS'], 'Invalid Account type.'),
  roleName: z.enum(['coe', 'assistant']).optional()
})
