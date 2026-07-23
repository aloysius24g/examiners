import * as yup from 'yup';

const schema = yup.object({
    userName: yup 
        .string()
        .trim()
        .matches(/^[a-zA-Z0-9]+$/, 'username should not contain space and specical characters.')
        .min(4, 'username cannot be less than 4 character.')
        .max(20, 'username cannot exceed 20 characters.')
        .required(),                                                                                   
    name: yup
      .string()
      .trim()
      .min(1, 'Name cannot be empty.')
      .max(50, 'Name cannot exceed 50 characters.')
      .required(),                                                                                   
    salutation: yup
      .string()
      .oneOf(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'])                                                                                
      .required(),
    roleName: yup
     .string()
     .oneOf(['coe', 'assistant'])
     .required(),
    password: yup
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
});

export default schema;
