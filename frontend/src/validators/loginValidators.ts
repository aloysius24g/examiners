import * as yup from 'yup';

export const examinerLoginInputSchema = yup.object({
  email: yup.
    string().
    trim().
    email('Invalid Email').
    required(),
  password: yup.
    string().
    min(1, 'Enter the password.').
    required()
})

export const officerLoginInputSchema = yup.object({
  userName: yup.
    string().
    trim().
    label('Username').
    min(1, 'Enter the userName.').
    required(),
  password: yup.
    string().
    min(1, 'Enter the password.').
    required()
})
