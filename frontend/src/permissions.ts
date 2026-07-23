import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { InferSubjects, MongoAbility } from "@casl/ability";
import type { UserContext } from "../../backend/src/utils/userContext";

type Actions = 'view' | 'create' | 'update' | 'delete'

interface ExaminerP {
  kind: 'examiner'
  id: number
}
interface OfficerP {
  kind: 'officer'
  id: number
}
interface PersonalInfoP {
  kind: 'personalInformation'
  userId: number
}
interface WorkPlaceP {
  kind: 'workPlace'
  userId: number
}
interface ContactP {
  kind: 'contact'
  userId: number
}
interface CoursesHandledP {
  kind: 'coursesHandled'
  userId: number
}

type ComplexSub = InferSubjects<OfficerP | ExaminerP | PersonalInfoP |ContactP | WorkPlaceP | CoursesHandledP>
type Subjects = 
| 'courseList'
| 'examinerList'
| 'officerList'
| 'officerActiveStatus'
| 'examinerPrivateFields'
| 'examinerPreference'
| 'examinerAuthenticity'
| ComplexSub

//type AppAbility = MongoAbility<[Actions, Sub]>

// TODO
// tired of making this type work, no luck do this later. no types and auto complete for now.

// getting the session context of the user and making permissions on every single resource in this
// database. I dont know how well this will go. hehehe
export function abilitiesFor(user: UserContext | null) {
  const ability = new AbilityBuilder<MongoAbility<[Actions, Subjects]>>(createMongoAbility)

  // abilities for any non logged in
  ability.can('create', 'examiner')

  if(user === null) {
    return ability.build({detectSubjectType: obj => obj.kind});
  }

  // abilities for any logged in users
  ability.can('view', 'courseList')

  // ablilites for ts staffs
  if(user.accountType === 'TS') {
    ability.can('view', 'examiner', {id: user.id})
    ability.can('update', 'workPlace', {userId: user.id})
    ability.can('update', 'contact', {userId: user.id})
    ability.can('update', 'coursesHandled', {userId: user.id})
    ability.can('update', 'personalInformation', {userId: user.id})
    return ability.build({detectSubjectType: obj => obj.kind});
  }

  if(user.accountType === 'NS') {
    ability.can('view', 'officer', {id: user.id})
    ability.can('view', 'examiner')
    ability.can('view', 'examinerList')
    if(user?.roleName === 'coe') {
      ability.can('create', 'officer')
      ability.can('view', 'officer')
      ability.can('view', 'officerList')
      ability.can('view', 'examinerPrivateFields')
      ability.can('view', 'examinerPreference')
      ability.can('view', 'examinerAuthenticity')
      ability.can('view', 'officerActiveStatus')
      ability.can('update', 'examinerPreference')
      ability.can('update', 'examinerAuthenticity')
      ability.can('update', 'officerActiveStatus')
    }
    return ability.build({detectSubjectType: obj => obj.kind});
  }
  return ability.build({detectSubjectType: obj => obj.kind});
}
