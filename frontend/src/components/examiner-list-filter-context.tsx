import createStorageContext from './context-store';

export type ExaminerFilterProps = {
  name: string,
  department: string,
  courseCode: string,
  courseTitle: string,
  preferredFor: string,
}

export const {
  Provider: ExaminerListFilterContext,
  useStorage: userExaminerListFilterContext
} = createStorageContext<ExaminerFilterProps | null> (
  'examiner-list-filter-context',
  null
)
