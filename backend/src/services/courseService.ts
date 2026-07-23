import { CourseDTO } from "../controllers/courseController.js";
import { getPracticalCourses, getTheoryCourses } from "../dal/courseDal.js";
import { success, error, Result } from "../utils/result.js";
import { ServiceError } from "../utils/serviceErrorAsValue.js";
import { getUserContext } from "../utils/userContext.js";
import { abilitiesFor } from "./permissions.js";

export async function getAllTheoryCourses(): Promise<Result<CourseDTO[], ServiceError>> {

  const context = getUserContext();

  const abiliy = abilitiesFor(context);

  if(abiliy.cannot('view', 'courseList')) {
    return error({
      cause: 'PermissionError',
      message: 'This resource is not accessible to public users'
    })
  }

  const theoryCourses = await getTheoryCourses()

  if(! theoryCourses.success) {
    switch(theoryCourses.error) {
      default: 
        return error({
        cause: 'DbError',
        message: 'Cannot get courses'
      })
    }
  }

  const theoryCoursesDTOComplied = theoryCourses.value
  .map(el => ({courseCode: el.courseCode, courseTitle: el.courseTitle}))

  return success(theoryCoursesDTOComplied)
}

export async function getAllPracticalCourses(): Promise<Result<CourseDTO[], ServiceError>> {

  const context = getUserContext();

  const abiliy = abilitiesFor(context);

  if(abiliy.cannot('view', 'courseList')) {
    return error({
      cause: 'PermissionError',
      message: 'This resource is not accessible to public users'
    })
  }

  const practicalCourses = await getPracticalCourses()

  if(! practicalCourses.success) {
    switch(practicalCourses.error) {
      default: 
        return error({
        cause: 'DbError',
        message: 'Cannot get courses'
      })
    }
  }

  const practicalCoursesDTOComplied = practicalCourses.value
  .map(el => ({courseCode: el.courseCode, courseTitle: el.courseTitle}))

  return success(practicalCoursesDTOComplied)
}
