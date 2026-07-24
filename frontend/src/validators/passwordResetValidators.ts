import * as yup from 'yup';

const schema = yup.object({
    email: yup
      .string()
      .trim()
      .email('Email is invalid.')
      .required(),
    otp: yup
    .string()
    .matches(/^\d+$/, 'Otp shoulb be numerical.')
    .length(6, 'Incomplete Otp')
    .required(),
    newPassword: yup
      .string()                                                                                  
      .min(8, 'Password must be at least 8 characters.')
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")                           
      .matches(/[a-z]/, "Password must contain at least one lowercase letter.")                           
      .matches(/[0-9]/, "Password must contain at least one number.")                                     
      .matches(                                                                                          
        /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/,                                                         
        "Password must contain at least one special character."                                         
      )
      .required(),
    confirmNewPassword: yup
      .string()                                                                                  
      .required("Confirm password is required")
      .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

export default schema;
