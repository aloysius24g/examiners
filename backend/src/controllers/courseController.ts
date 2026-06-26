import { Get, Route } from "tsoa";
import { getAllPracticalCourses, getAllTheoryCourses } from "../services/courseService.js";
import { InternalServerError, UnauthorizedError } from "../utils/httpErrors.js";

export type CourseDTO = {
  courseCode: string,
  courseTitle: string
}


@Route("courses")
export class courseController{

  @Get('theory')
  public async getTheoryCourses(
  ): Promise<CourseDTO[]> {
    const coursesRes = await getAllTheoryCourses();

    if(! coursesRes.success) {
      switch(coursesRes.error.cause) {
        case "PermissionError":
          throw new UnauthorizedError(coursesRes.error.message);
        case "DbError":
        case "ValidationError":
        case "BussinessConstraintViolation":
        case "NotFoundError":
          throw new InternalServerError('cant get theory courses');
      }
    }
    return coursesRes.value;
  }

  @Get('practical')
  public async getPracticalCourses(
  ): Promise<CourseDTO[]> {
    const coursesRes = await getAllPracticalCourses();

    if(! coursesRes.success) {
      switch(coursesRes.error.cause) {
        case "PermissionError":
          throw new UnauthorizedError(coursesRes.error.message);
        case "DbError":
        case "ValidationError":
        case "BussinessConstraintViolation":
        case "NotFoundError":
          throw new InternalServerError('cant get theory courses');
      }
    }
    return coursesRes.value;
  }
}
