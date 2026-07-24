import { z } from "zod";

//TODO
//better error messages

export const tsUserRegistrationSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.email().trim(),
  otp: z.string().length(6, 'otp should be 6 digits.'),
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
  phone: z.string().trim().regex(/^[0-9]{10}$/, "phone must be 10 characters and only numerical"),
  aicteNo: z.string()
    .trim()
    .regex(/^\d+$/, "AICTE number must contain only numbers")
    .length(10, "AICTE number must be 10 character long")
    .nullable(),
  annaUnivNo: z.string()
    .trim()
    .regex(/^\d+$/, "Anna university number must contain only numbers")
    .min(10, 'Anna university number should be atleast 10 char long')
    .nullable(),
  yearOfExperience: z.number()
    .min(0, 'year of experience should be greater than or equal to 0')
    .max(40, 'year of experience is invalid'),
  collegeName: z.string().trim().min(1).max(200),
  collegePlace: z.string().trim().min(1).max(30),
  collegePinCode: z.string().trim().regex(/^[0-9]{6}$/, "pincode should be 6 character long and must be numerical"),
  idCardImageFileName: z.string().min(1).max(200), // questionable max length, i dont have db limit but still i thik 200 is ok.
  department: z.enum([
    "Artificial Intelligence and Data Science",
    "Civil Engineering",
    "Mechanical Engineering",
    "Computer Science and Engineering",
    "Computer Science and Engineering (Cyber Security)",
    "Electrical and Electronics Engineering",
    "Electronics and Communication Engineering",
    "Information Technology",
    "Management Studies",
    "Computer Applications"
  ]),
  designation: z.enum([
    "Assistant Professor",
    "Associate Professor",
    "Professor"
  ]),
});

//does this even used or duplicated?
export const contactSchema = tsUserRegistrationSchema.pick({
  email: true,
  phone: true
});

export const contactInputSchema = tsUserRegistrationSchema.pick({
  email: true,
  phone: true,
  otp: true
});

export const workplaceSchema = tsUserRegistrationSchema.pick({
  designation: true,
  collegeName: true,
  collegePlace: true,
  collegePinCode: true,
  idCardImageFileName: true,
});

export const updatablePersonalInfoSchema = tsUserRegistrationSchema.pick({
  aicteNo: true,
  annaUnivNo: true,
  yearOfExperience: true,
});

export const resetPasswordSchema = tsUserRegistrationSchema.pick({
  email: true,
  otp: true,
}).extend({
  newPassword: tsUserRegistrationSchema.shape.password
});

export const preferrenceSchema = z.enum([
  'questionSetter',
  'questionScrutinizer',
  'examinerPractical',
  'examinerValuation'
]);

export const preferencesSchema = z.array(preferrenceSchema);
