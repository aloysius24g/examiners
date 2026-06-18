import z from "zod";

const NSCredentialsSchema = z.object({
  accountType: z.literal('NS'),
  userName: z.string(),
  password: z.string()
})

const TSCredentialsSchema = z.object({
  accountType: z.literal('TS'),
  email: z.string(),
  password: z.string()
})

export const credentialSchema = z.discriminatedUnion('accountType', [TSCredentialsSchema, NSCredentialsSchema])
