import z from "zod";

export const nsUserRegistrationSchema = z.object({
  userName: z.string().
    min(4, 'Username should be atleast 4 character').
    max(20, 'Username should not exceed 20 character').
    regex(/^[a-zA-Z0-9]+$/, {
      message: 'username must only contain alphabets and numbers'
    }),
  name: z.string().min(1).max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character"
    ),
  salutation: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"]),
  roleName: z.enum(['coe', 'assistant'])
});
