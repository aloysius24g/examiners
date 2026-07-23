import z from "zod";

export const courseSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string()
})

export const courseListSchema = z.array(courseSchema)
//.max(10, 'Max 10 courses are only Allowed');
//10 couses max
//disabled for now
