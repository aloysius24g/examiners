import { z } from "zod";

export const contextSchema = z.object({
  userName: z.string(), 
  role: z.enum(['USER', 'MOD', 'ADMIN']),
  signedAs: z.enum(['refreshToken', 'accessToken'])
});

export type Context = z.infer<typeof contextSchema>;
