import * as yup from 'yup';

const schema = yup.object({
    name: yup
      .string()
      .trim()
      .min(1, 'Name cannot be empty.')
      .max(50, 'Name cannot exceed 50 characters.')
      .required(),                                                                                   
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
    salutation: yup
      .string()
      .oneOf(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'])                                                                                
      .required(),
    phone: yup
      .string()                                                                                     
      .trim()
      .matches(/^\d+$/, 'Phone number should be numerical.')
      .length(10, 'Phone number should be 10 character long.')
      .required(),
    aicteNo: yup
      .string()                                                                                   
      .trim()
      .label('AICTE number')
      .matches(/^\d+$/, 'AICTE number must contain only numbers.')
      .length(9, 'AICTE number must have 10 digits.')
      .nullable()
      .transform(v => v==='' ? null : v)
      .default(null),
    annaUnivNo: yup
      .string()                                                                                   
      .trim()
      .label('Anna University number')
      .matches(/^\d+$/, 'Anna University number must contain only numbers.')
      .length(10, 'Anna University number must have 10 digits.')
      .nullable()
      .transform(v => v==='' ? null : v)
      .default(null),
    yearOfExperience: yup
      .number()
      .typeError('Year of Experience should be numerical.')
      .label('Year of Experience')
      .min(0, 'Year of Experience is must be positive.')
      .max(40, 'Year of Experience cannot be greater than 40.')
      .required(),
    collegeName: yup
      .string()
      .trim()
      .label('College name')
      .min(1, 'College name cannot be empty.')
      .max(200, 'College name cannot exceed 200 characters.')
      .required(),                                                                               
    collegePlace: yup
      .string()
      .trim()
      .label('College place')
      .min(1, 'College place cannot be empty.')
      .max(30, 'College place cannot exceed 30 characters.')
      .required(),                                                                              
    collegePinCode: yup
      .string()
      .trim()
      .label('College pincode')
      .matches(/^[0-9]{6}$/, 'Invalid Pincode')
      .required(),
    idCardImage: yup
      .mixed<File>()
      .required('Upload id Image.')
      .test(
        'fileSize',
        'file size must be less than 100 mb.',
        (v) => {
          if(!v) {
            return false;
          }
          return v.size <= (100 * 1024 * 1024)
        }
      ),
    department: yup
      .string()
      .oneOf([                                                                                
        "Artificial Intelligence and Data Science",                                                      
        "Civil Engineering",                                                                             
        "Mechanical Engineering",                                                                        
        "Computer Science and Engineering",                                                                            
        "Computer Science and Engineering (Cyber Security)",                                             
        "Electrical and Electronics Engineering",                                                        
        "Electronics and Communication Engineering",                                                     
        "Information Technology",                                                                        
        "Management Studies",                                                                            
        "Computer Applications",
        "Maths",
        "Physics",
        "Chemistry",
        "English",
        "Tamil"
      ])
      .required(),
    designation: yup
      .string()
      .oneOf([
        "Assistant Professor",                                                                           
        "Associate Professor",                                                                           
        "Professor"
      ])
      .required(),
    acknoledgement: yup
    .boolean()
    .oneOf([true], 'Check the Acknoledgement.')
});

export default schema;
