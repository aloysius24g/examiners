import { z } from "zod";

//TODO
//better error messages

export const tsUserRegistrationSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.email(),
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
  phone: z.string().regex(/^[0-9]{10}$/, "phone must be 10 characters and only numerical"),
  aicteNo: z.string()
  .regex(/^\d+$/, "aicte number must contain only numbers")
  .length(10, "aicte number must be 10 character long"),
  annaUnivNo: z.string().min(10, 'Anna university number should be atleast 10 char long'),
  yearOfExperience: z.number().int().min(0, 'year of experience should be greater than or equal to 0'),
  collegeName: z.string().min(1).max(200),
  collegePlace: z.string().min(1).max(30),
  collegePinCode: z.string().regex(/^[0-9]{6}$/, "pincode should be 6 character long and must be numerical"),
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
