import examinerRegistrationValidator from './registrationValidator';

export const collegeValidator = examinerRegistrationValidator.pick([
  'designation',
  'collegeName',
  'collegePlace',
  'collegePinCode',
  'idCardImage'
]);

export const contactValidator = examinerRegistrationValidator.pick(['email', 'phone', 'otp'])

export const personalInfoValidator = examinerRegistrationValidator.pick([
  'aicteNo', 'annaUnivNo', 'yearOfExperience'
])
