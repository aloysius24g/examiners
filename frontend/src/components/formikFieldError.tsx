import type { FormikState } from "formik";
import { CircleX } from "lucide-react";

type ErrorFieldProps = {
 formikState: FormikState<any>,
 name: string
} 
export default function FormikErrorField({formikState, name}: ErrorFieldProps) {
  if(! formikState.touched[name] || ! formikState.errors[name]) {
    return;
  }

  return <div className='text-destructive'>
      <CircleX size={14} className='inline mr-1'/>
      {formikState.errors[name].toString()}
  </div>
}
